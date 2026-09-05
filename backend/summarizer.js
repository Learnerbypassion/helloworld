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
**Uploaded Document Analysis / Lab Findings:** [Interpret all lab tests, blood parameters like CBC/Haematology, numerical values, and reference ranges found in OCR text, or "None uploaded"]
**Extracted Medications:** [Medications with dosage and frequency, or "None"]
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

module.exports = { generateSummary };
