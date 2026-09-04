/**
 * MediKiosk — rule-based medication / lab entity extraction.
 * Ported 1:1 from the Python ocr.py implementation.
 *
 * Swap for a trained clinical NER model (mapped to SNOMED-CT/LOINC) for
 * production use — this is a regex + known-drug-list demo extractor.
 */
const LAB_REFERENCE_RANGES = {
  hba1c: { low: 4.0, high: 5.6, unit: "%", label: "HbA1c" },
  hemoglobin: { low: 12.0, high: 16.0, unit: "g/dL", label: "Hemoglobin" },
  glucose: { low: 70, high: 110, unit: "mg/dL", label: "Fasting Glucose" },
  creatinine: { low: 0.6, high: 1.3, unit: "mg/dL", label: "Creatinine" },
  wbc: { low: 4000, high: 11000, unit: "/µL", label: "WBC Count" },
  cholesterol: { low: 0, high: 200, unit: "mg/dL", label: "Total Cholesterol" },
};

const KNOWN_DRUGS = [
  "paracetamol", "metformin", "amlodipine", "amoxicillin", "ibuprofen",
  "azithromycin", "insulin", "atorvastatin", "losartan", "omeprazole",
  "cetirizine", "aspirin", "pantoprazole", "salbutamol", "ciprofloxacin",
];

const FREQ_PATTERNS = [
  [/\bod\b/i, "Once daily (OD)"],
  [/\bbd\b/i, "Twice daily (BD)"],
  [/\btds?\b/i, "Thrice daily (TDS)"],
  [/\bqid\b/i, "Four times daily (QID)"],
  [/\bsos\b/i, "As needed (SOS)"],
  [/once\s+daily/i, "Once daily (OD)"],
  [/twice\s+daily/i, "Twice daily (BD)"],
];

function extractMedications(text) {
  const meds = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.toLowerCase();
    for (const drug of KNOWN_DRUGS) {
      if (line.includes(drug)) {
        const doseMatch = line.match(/(\d+(\.\d+)?)\s*(mg|mcg|ml|g)\b/);
        const dose = doseMatch ? `${doseMatch[1]}${doseMatch[3]}` : null;
        let freq = null;
        for (const [pat, label] of FREQ_PATTERNS) {
          if (pat.test(line)) { freq = label; break; }
        }
        meds.push({
          drug: drug[0].toUpperCase() + drug.slice(1),
          dose: dose || "Not specified",
          frequency: freq || "Not specified",
        });
      }
    }
  }
  const seen = new Set();
  const unique = [];
  for (const m of meds) {
    if (!seen.has(m.drug)) { seen.add(m.drug); unique.push(m); }
  }
  return unique;
}

function extractLabs(text) {
  const labs = [];
  const lower = text.toLowerCase();
  for (const [key, ref] of Object.entries(LAB_REFERENCE_RANGES)) {
    const pattern = new RegExp(key.replace(/_/g, "\\s*") + "\\D{0,10}?(\\d+(\\.\\d+)?)");
    const m = lower.match(pattern);
    if (m) {
      const value = parseFloat(m[1]);
      const abnormal = value < ref.low || value > ref.high;
      labs.push({
        name: ref.label,
        value,
        unit: ref.unit,
        ref_range: `${ref.low}\u2013${ref.high} ${ref.unit}`,
        abnormal,
      });
    }
  }
  return labs;
}

function processExtractedText(rawText) {
  const text = rawText || "";
  return {
    raw_text: text.trim(),
    medications: extractMedications(text),
    labs: extractLabs(text),
  };
}

module.exports = { extractMedications, extractLabs, processExtractedText };
