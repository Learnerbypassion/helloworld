/**
 * MediKiosk -- AI Clinical Summary Generator
 *
 * Tries local Ollama (OLLAMA_URL env, default http://localhost:11434).
 * On any error (service down, timeout, bad model), returns null.
 * Never throws -- submission flow is never blocked by LLM availability.
 *
 * Only structured fields sent to LLM. Raw OCR text is NOT included.
 */
const axios = require("axios");

const OLLAMA_URL   = process.env.OLLAMA_URL   || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const LLM_TIMEOUT  = parseInt(process.env.LLM_TIMEOUT_MS || "60000", 10);

function buildPrompt(session, docs) {
  const mode = session.ayush_mode ? "AYUSH / Ayurvedic" : "Allopathic";
  const cc   = session.chief_complaint || "Not specified";

  const hpiLines = (session.hpi_details || []).map(d =>
    typeof d === "string" ? d : (d.label ? `${d.label}: ${d.value}` : String(d))
  ).join("\n") || "Not provided";

  const ayushBlock = session.ayush_mode && session.ayush_fields
    ? Object.entries(session.ayush_fields)
        .filter(([, v]) => v)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n") || "  (none provided)"
    : null;

  const medsBlock = docs.flatMap(d => d.extracted_meds || [])
    .map(m => `  - ${m.drug || m.name || "Unknown"}: ${m.dose || ""} ${m.frequency || ""}`.trimEnd())
    .join("\n") || "  None extracted";

  const labsBlock = docs.flatMap(d => d.extracted_labs || [])
    .map(l => `  - ${l.name}: ${l.value} ${l.unit} (ref ${l.ref_range})${l.abnormal ? " ABNORMAL" : ""}`)
    .join("\n") || "  None extracted";

  // Raw OCR text from uploaded prescriptions / lab reports
  const ocrBlock = (docs || [])
    .map((d, i) => {
      const txt = d.raw_ocr_text || d.raw_text || "";
      if (!txt.trim()) return null;
      return `--- Document #${i + 1} (${d.filename || "Uploaded Report"}) ---\n${txt.trim()}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const triage = session.red_flag
    ? `RED FLAG: ${session.red_flag_reason || "Emergency triage alert"}`
    : "No immediate triage concerns";

  let prompt = `You are an expert clinical AI scribe in a hospital OPD. Write a concise, structured physician-ready summary from the intake and uploaded medical documents below.
Analyze all provided text, including any raw OCR text from uploaded lab reports, prescriptions, and blood tests (e.g. CBC, haematology, platelets, medications).
Extract and interpret clinical findings accurately. Output ONLY the summary in plain clinical English.

=== INTAKE ===
Mode: ${mode}
Chief Complaint: ${cc}
Triage: ${triage}

HPI:
${hpiLines}`;

  if (ayushBlock) prompt += `\n\nDashavidha Pariksha:\n${ayushBlock}`;

  if (ocrBlock) {
    prompt += `\n\n=== UPLOADED DOCUMENT / LAB REPORT OCR TEXT ===\n${ocrBlock}`;
  } else {
    prompt += `\n\nExtracted Medications:\n${medsBlock}`;
    prompt += `\n\nExtracted Labs:\n${labsBlock}`;
  }

  prompt += `

=== OUTPUT FORMAT ===
**Chief Complaint:** [one sentence]
**Key History:** [2-4 bullets]
**Red Flags / Triage:** [status and reason, or "None"]
**Uploaded Document Analysis / Lab Findings:**
Present all detected lab parameters in a structured Markdown Key-Value table format:
| Parameter | Value | Reference Range | Status |
|---|---|---|---|
| [Test Name] | [Observed Value + Unit] | [Normal Range] | [Normal / Low / High] |
Followed by a 1-2 sentence clinical summary of the findings. If no lab document was uploaded, write: "No document uploaded".
**Extracted Medications:** [List of medications with dose and frequency, or "None"]
**Clinical Assessment & Suggested Priority:** [Routine / Urgent / Emergency with brief clinical rationale]`;

  return prompt;
}

async function generateSummary(session, docs) {
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      { model: OLLAMA_MODEL, prompt: buildPrompt(session, docs), stream: false },
      { timeout: LLM_TIMEOUT }
    );
    const text = response.data?.response?.trim();
    console.log("This is coming from the summarizer",text)
    return text || null;
  } catch (err) {
    const code = err.code || "";
    if (code === "ECONNREFUSED" || code === "ECONNRESET")
      console.info("[summarizer] Ollama not available -- summary skipped");
    else if (code === "ETIMEDOUT" || code === "ECONNABORTED")
      console.info("[summarizer] Ollama timed out -- summary skipped");
    else
      console.info("[summarizer] LLM error (%s) -- summary skipped", code || err.message?.slice(0,60));
    return null;
  }
}


// -----------------------------------------------------------------------
// AI-driven HPI follow-up question generation
// -----------------------------------------------------------------------
async function generateHpiQuestions(session) {
  try {
    const cc = session.chief_complaint || "General Consultation";
    const transcript = session.transcript || "";
    const mode = session.ayush_mode ? "Ayurvedic" : "Allopathic";
    const prompt = `You are an expert Clinical Triage AI at a hospital OPD kiosk.
The patient has reported the following symptom/condition:
- Chief Complaint: ${cc}
${transcript ? "- Spoken Voice Description / Details: " + transcript : ""}
- Consultation Mode: ${mode}

Analyze the patient's specific symptom or condition and select the 4 to 5 most clinically appropriate follow-up questions to ask this patient.
Make the questions directly targeted to the patient's specific condition (e.g. if ear pain, ask about ear discharge/swimming; if skin rash, ask about itching/spreading; if joint pain, ask about swelling/morning stiffness; if eye problem, ask about vision blurriness/redness).
Include:
1. Duration / Onset question (e.g. "When did your [symptom] start?")
2. Severity rating question (e.g. "On a scale of 0 to 10 or 1 to 10, how severe is the pain/discomfort?")
3. 1 or 2 specific clinical feature questions tailored specifically to this symptom/disease.
4. Relieving/aggravating factors or medication taken.

Rules:
- Questions must be plain-language, clear, and easy for a patient to answer.
- Respond ONLY with a valid JSON array of question strings in English. No markdown, no explanation, just the JSON array.
Example: ["When did the ear pain start?", "On a scale of 1-10, how severe is the pain?", "Do you notice any pus or fluid discharge from the ear?", "Have you taken any painkillers or ear drops?"]`;

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      { model: OLLAMA_MODEL, prompt, stream: false },
      { timeout: 25000 }
    );
    const raw = response.data?.response?.trim() || "";
    // Extract JSON array from the response
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return defaultHpiQuestions(cc);
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed.filter(q => typeof q === "string" && q.length > 5) : defaultHpiQuestions(cc);
  } catch (err) {
    console.info("[summarizer] HPI questions generation skipped:", err.message?.slice(0, 60));
    return defaultHpiQuestions(session.chief_complaint || "");
  }
}

function defaultHpiQuestions(cc) {
  return [
    `How long have you been experiencing ${cc || "these symptoms"}?`,
    "On a scale of 1-10, how severe is your discomfort?",
    "Does anything make your symptoms better or worse?",
    "Do you have any fever, nausea, or other associated symptoms?",
    "Have you taken any medication for this? If yes, which one?",
  ];
}

// -----------------------------------------------------------------------
// AI doctor recommendation
// -----------------------------------------------------------------------
async function recommendDoctor(session, doctors) {
  if (!doctors || doctors.length === 0) return null;
  try {
    const cc = session.chief_complaint || "General Consultation";
    const mode = session.ayush_mode ? "AYUSH/Ayurvedic" : "Allopathic";
    const doctorList = doctors.map((d, i) => `${i + 1}. ${d.name} — ${d.specialization || d.doctor_type || "General Medicine"}`).join("\n");
    const prompt = `You are a clinical triage AI. Based on the patient's chief complaint, recommend the most suitable doctor.

Chief Complaint: ${cc}
Mode: ${mode}

Available Doctors:
${doctorList}

Reply with ONLY valid JSON in this exact format (no explanation):
{"doctor_index": 1, "rationale": "Brief one-sentence reason"}

Use the 1-based index from the list above.`;

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      { model: OLLAMA_MODEL, prompt, stream: false },
      { timeout: 15000 }
    );
    const raw = response.data?.response?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { doctor_id: doctors[0].id, rationale: "" };
    const parsed = JSON.parse(match[0]);
    const idx = (parsed.doctor_index || 1) - 1;
    const chosen = doctors[Math.max(0, Math.min(idx, doctors.length - 1))];
    return { doctor_id: chosen.id || chosen._id?.toString(), rationale: parsed.rationale || "" };
  } catch (err) {
    console.info("[summarizer] Doctor recommendation skipped:", err.message?.slice(0, 60));
    return { doctor_id: doctors[0]?.id || doctors[0]?._id?.toString(), rationale: "" };
  }
}

module.exports = { generateSummary, generateHpiQuestions, recommendDoctor };
