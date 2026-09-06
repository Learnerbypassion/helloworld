/**
 * MediKiosk — Comprehensive Clinical Laboratory & Medication Extractor
 * Supports structured markdown tables, multi-line OCR test reports,
 * and standard clinical reference ranges (KFT, LFT, CBC, Lipids, Diabetes, Thyroid, Electrolytes).
 */

const LAB_REFERENCE_RANGES = {
  // Kidney Function Tests (KFT / RFT) & Electrolytes
  serum_urea: { low: 19.0, high: 45.0, unit: "mg/dL", label: "Serum Urea", patterns: [/serum\s*urea\b/i, /\burea\b/i] },
  serum_creatinine: { low: 0.72, high: 1.18, unit: "mg/dL", label: "Serum Creatinine", patterns: [/serum\s*creatinine\b/i] },
  creatinine: { low: 0.6, high: 1.3, unit: "mg/dL", label: "Creatinine", patterns: [/\bcreatinine\b/i] },
  egfr: { low: 90.0, high: 999.0, unit: "ml/min/1.73m²", label: "EGFR", patterns: [/\begfr\b|estimated\s*gfr/i] },
  bun: { low: 7.9, high: 20.0, unit: "mg/dL", label: "BUN", patterns: [/\bbun\b|blood\s*urea\s*nitrogen/i] },
  urea_creatinine_ratio: { low: 10.0, high: 20.0, unit: "", label: "UREA/Creatinine Ratio", patterns: [/urea\s*\/\s*creatinine\s*ratio/i] },
  bun_creatinine_ratio: { low: 10.0, high: 20.0, unit: "", label: "BUN/Creatinine Ratio", patterns: [/bun\s*\/\s*creatinine\s*ratio/i] },
  serum_calcium: { low: 8.8, high: 10.6, unit: "mg/dL", label: "Serum Calcium", patterns: [/serum\s*calcium\b|\bcalcium\b/i] },
  serum_potassium: { low: 3.5, high: 5.1, unit: "mmol/L", label: "Serum Potassium", patterns: [/serum\s*potassium\b|\bpotassium\b/i] },
  serum_sodium: { low: 136.0, high: 146.0, unit: "mmol/L", label: "Serum Sodium", patterns: [/serum\s*sodium\b|\bsodium\b/i] },
  serum_uric_acid: { low: 3.5, high: 7.2, unit: "mg/dL", label: "Serum Uric Acid", patterns: [/serum\s*uric\s*acid\b|uric\s*acid\b/i] },

  // Diabetes / Glycemic
  hba1c: { low: 4.0, high: 5.6, unit: "%", label: "HbA1c", patterns: [/\bhba1c\b|glycated\s*hemoglobin/i] },
  fasting_glucose: { low: 70.0, high: 100.0, unit: "mg/dL", label: "Fasting Glucose", patterns: [/fasting\s*(blood\s*)?glucose\b|fasting\s*blood\s*sugar\b|\bfbs\b/i] },
  glucose: { low: 70.0, high: 140.0, unit: "mg/dL", label: "Blood Glucose", patterns: [/\bglucose\b|blood\s*sugar\b|\brbs\b/i] },

  // Complete Blood Count (CBC)
  hemoglobin: { low: 12.0, high: 16.0, unit: "g/dL", label: "Hemoglobin", patterns: [/\bhemoglobin\b|\bhgb?\b/i] },
  wbc: { low: 4000, high: 11000, unit: "/µL", label: "WBC Count", patterns: [/total\s*leucocyte\s*count\b|\bwbc\b|\btlc\b/i] },
  platelets: { low: 1.5, high: 4.5, unit: "lakh/µL", label: "Platelet Count", patterns: [/platelet\s*count\b|\bplatelets\b/i] },
  rbc: { low: 4.2, high: 5.8, unit: "mil/µL", label: "RBC Count", patterns: [/\brbc\s*count\b|red\s*blood\s*cell/i] },
  pcv: { low: 36.0, high: 50.0, unit: "%", label: "PCV / Hematocrit", patterns: [/\bpcv\b|hematocrit/i] },
  esr: { low: 0, high: 20, unit: "mm/hr", label: "ESR", patterns: [/\besr\b|erythrocyte\s*sedimentation/i] },

  // Liver Function Tests (LFT)
  bilirubin_total: { low: 0.2, high: 1.2, unit: "mg/dL", label: "Total Bilirubin", patterns: [/total\s*bilirubin\b|\bbilirubin\s*total\b/i] },
  bilirubin_direct: { low: 0.0, high: 0.3, unit: "mg/dL", label: "Direct Bilirubin", patterns: [/direct\s*bilirubin\b|conjugated\s*bilirubin\b/i] },
  sgot: { low: 5.0, high: 40.0, unit: "U/L", label: "SGOT (AST)", patterns: [/\bsgot\b|\bast\b|aspartate\s*aminotransferase/i] },
  sgpt: { low: 7.0, high: 56.0, unit: "SGPT (ALT)", label: "SGPT (ALT)", patterns: [/\bsgpt\b|\balt\b|alanine\s*aminotransferase/i] },
  alp: { low: 44.0, high: 147.0, unit: "U/L", label: "Alkaline Phosphatase", patterns: [/alkaline\s*phosphatase\b|\balp\b/i] },
  total_protein: { low: 6.0, high: 8.3, unit: "g/dL", label: "Total Protein", patterns: [/total\s*protein\b/i] },
  albumin: { low: 3.5, high: 5.0, unit: "g/dL", label: "Albumin", patterns: [/\balbumin\b/i] },
  globulin: { low: 2.0, high: 3.5, unit: "g/dL", label: "Globulin", patterns: [/\bglobulin\b/i] },

  // Lipid Profile
  cholesterol: { low: 0.0, high: 200.0, unit: "mg/dL", label: "Total Cholesterol", patterns: [/total\s*cholesterol\b|\bcholesterol\b/i] },
  triglycerides: { low: 0.0, high: 150.0, unit: "mg/dL", label: "Triglycerides", patterns: [/\btriglycerides?\b/i] },
  hdl: { low: 40.0, high: 60.0, unit: "mg/dL", label: "HDL Cholesterol", patterns: [/\bhdl\b|hdl\s*cholesterol/i] },
  ldl: { low: 0.0, high: 100.0, unit: "mg/dL", label: "LDL Cholesterol", patterns: [/\bldl\b|ldl\s*cholesterol/i] },
  vldl: { low: 5.0, high: 30.0, unit: "mg/dL", label: "VLDL Cholesterol", patterns: [/\bvldl\b|vldl\s*cholesterol/i] },

  // Thyroid
  tsh: { low: 0.4, high: 4.0, unit: "µIU/mL", label: "TSH", patterns: [/\btsh\b|thyroid\s*stimulating/i] },
  t3: { low: 80.0, high: 200.0, unit: "ng/dL", label: "Total T3", patterns: [/\bt3\b|triiodothyronine/i] },
  t4: { low: 5.0, high: 12.0, unit: "µg/dL", label: "Total T4", patterns: [/\bt4\b|thyroxine/i] },
};

const KNOWN_DRUGS = [
  "paracetamol", "metformin", "amlodipine", "amoxicillin", "ibuprofen",
  "azithromycin", "insulin", "atorvastatin", "losartan", "omeprazole",
  "cetirizine", "aspirin", "pantoprazole", "salbutamol", "ciprofloxacin",
  "telmisartan", "glimepiride", "montelukast", "hydroxychloroquine", "levothyroxine",
  "doxycycline", "clavulanate", "cefixime", "ranitidine", "ondansetron"
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
  for (const rawLine of (text || "").split(/\r?\n/)) {
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

/**
 * Parses markdown table (from AI Summary or LLM triage)
 */
function parseLabsFromMarkdownTable(text) {
  if (!text) return [];
  const labs = [];
  const lines = text.split(/\r?\n/);
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (inTable && trimmed.length > 0 && !trimmed.startsWith('|')) inTable = false;
      continue;
    }
    const cols = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
    if (cols.length >= 2) {
      const firstCol = cols[0].toLowerCase();
      if (firstCol.includes('parameter') || firstCol.includes('test') || firstCol.includes('investigation')) {
        inTable = true;
        continue;
      }
      if (cols.every(c => /^[-:\s]+$/.test(c))) {
        continue;
      }
      if (inTable && cols[0]) {
        const paramName = cols[0].replace(/[*_]/g, '').trim();
        const rawVal = (cols[1] || '').replace(/[*_]/g, '').trim();
        const refRange = (cols[2] || '').replace(/[*_]/g, '').trim();
        const status = (cols[3] || '').replace(/[*_]/g, '').trim();

        const valMatch = rawVal.match(/^([><=~]?\s*[\d.]+)\s*(.*)$/);
        const valStr = valMatch ? valMatch[1].trim() : rawVal;
        const numVal = isNaN(parseFloat(valStr)) ? valStr : parseFloat(valStr);
        const unit = valMatch ? valMatch[2].trim() : '';

        const abnormal = /high|low|abnormal|elevated|borderline/i.test(status);

        labs.push({
          name: paramName,
          value: numVal,
          unit: unit,
          ref_range: refRange || 'Normal',
          abnormal: abnormal,
          status: status || (abnormal ? 'Abnormal' : 'Normal')
        });
      }
    }
  }
  return labs;
}

/**
 * Parses multi-line clinical laboratory reports from raw OCR text
 */
function extractLabsFromOcrText(text) {
  if (!text) return [];
  const labs = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const foundKeys = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const [key, ref] of Object.entries(LAB_REFERENCE_RANGES)) {
      if (foundKeys.has(key)) continue;
      if (key === 'creatinine' && foundKeys.has('serum_creatinine')) continue;
      if (key === 'glucose' && foundKeys.has('fasting_glucose')) continue;

      const matchedPattern = ref.patterns.some(pat => pat.test(line));
      if (matchedPattern) {
        // Look ahead in the next 1-6 lines for value, unit, reference range
        let value = null;
        let unit = ref.unit;
        let refRange = null;
        let abnormal = false;

        // Check if value is on same line: e.g. "SERUM CREATININE 0.69 mg/dl"
        const inlineMatch = line.match(/([><=~]?\s*\d+(\.\d+)?)\s*(mg\/dl|mmol\/l|g\/dl|%|\/µl|ml\/min[^\s]*|u\/l)?/i);
        if (inlineMatch && !line.toLowerCase().startsWith(inlineMatch[1])) {
          // ensure number isn't part of title
        }

        // Search following 1-6 lines
        for (let j = i + 1; j <= Math.min(i + 6, lines.length - 1); j++) {
          const nextLine = lines[j];

          // If next line hits another lab test name, stop looking ahead
          const isNextTest = Object.values(LAB_REFERENCE_RANGES).some(other =>
            other !== ref && other.patterns.some(p => p.test(nextLine))
          );
          if (isNextTest) break;

          // Check for flag (L or H or High or Low)
          if (/^(L|Low|Below)$/i.test(nextLine)) abnormal = true;
          if (/^(H|High|Above|Elevated)$/i.test(nextLine)) abnormal = true;

          // Check for numeric value
          if (value === null) {
            const numMatch = nextLine.match(/^([><=~]?\s*\d+(\.\d+)?)$/);
            if (numMatch) {
              value = parseFloat(numMatch[1].replace(/[^0-9.]/g, ''));
              continue;
            }
          }

          // Check for unit
          if (/^(mg\/dl|mmol\/l|g\/dl|%|lakh\/µl|\/µl|u\/l|µiu\/ml|ng\/dl|µg\/dl|ml\/min\/1\.73m\*?2)$/i.test(nextLine)) {
            unit = nextLine;
            continue;
          }

          // Check for reference range (e.g. 19-45, 0.72-1.18, > 90, 8.8 - 10.6)
          const rangeMatch = nextLine.match(/^([><=~]?\s*\d+(\.\d+)?\s*[-–]\s*\d+(\.\d+)?|[><=]\s*\d+(\.\d+)?)$/);
          if (rangeMatch) {
            refRange = rangeMatch[1];
          }
        }

        if (value !== null) {
          foundKeys.add(key);
          const isAbnormal = abnormal || (value < ref.low || value > ref.high);
          labs.push({
            name: ref.label,
            value,
            unit: unit || ref.unit,
            ref_range: refRange ? `${refRange} ${unit || ref.unit}` : `${ref.low}–${ref.high} ${ref.unit}`,
            abnormal: isAbnormal,
            status: isAbnormal ? (value < ref.low ? "Low" : "High") : "Normal"
          });
        }
      }
    }
  }

  return labs;
}

/**
 * Universal laboratory extractor (combines markdown table parsing + multi-line OCR parsing)
 */
function extractLabs(text) {
  if (!text) return [];

  // Strategy 1: If text contains a markdown table, parse it directly (highest precision)
  const mdLabs = parseLabsFromMarkdownTable(text);

  // Strategy 2: Parse multi-line OCR text directly
  const ocrLabs = extractLabsFromOcrText(text);

  if (mdLabs.length >= ocrLabs.length && mdLabs.length > 0) {
    return mdLabs;
  }

  if (ocrLabs.length > 0) {
    // Merge any additional fields from mdLabs if available
    const merged = [...ocrLabs];
    for (const m of mdLabs) {
      const exists = merged.some(l => l.name.trim().toLowerCase() === m.name.trim().toLowerCase());
      if (!exists) merged.push(m);
    }
    return merged;
  }

  return mdLabs;
}

function processExtractedText(rawText) {
  const text = rawText || "";
  return {
    raw_text: text.trim(),
    medications: extractMedications(text),
    labs: extractLabs(text),
  };
}

module.exports = {
  extractMedications,
  extractLabs,
  parseLabsFromMarkdownTable,
  processExtractedText,
  LAB_REFERENCE_RANGES
};
