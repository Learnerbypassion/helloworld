/**
 * MediKiosk -- Configurable Red-Flag Detection Rules
 *
 * ========================================================================
 * CLINICAL REVIEW REQUIRED -- AYUSH KEYWORDS ARE A PLACEHOLDER
 * The ayushPatterns in every rule below were drafted by engineers, NOT by
 * a licensed Ayurvedic or Allopathic physician. They must be reviewed and
 * approved by a qualified clinician before any clinical deployment.
 * ========================================================================
 *
 * Edit this file to update rules without redeploying.
 */

const RED_FLAG_RULES = {
  chest: {
    reason: "Chest pain -- possible cardiac / respiratory emergency. Seek immediate attention.",
    patterns: [/chest\s*pain/i, /heart\s*attack/i, /cardiac/i, /angina/i, /\bmi\b/i],
    ayushPatterns: [/hridroga/i, /hridaya\s*shula/i], // [PLACEHOLDER -- PENDING CLINICAL REVIEW]
  },
  stroke: {
    reason: "Sudden facial drooping / arm weakness / speech difficulty -- FAST stroke criteria met.",
    patterns: [/stroke/i, /face.*droop/i, /arm.*weak/i, /speech.*difficult/i, /slurred/i, /\btia\b/i],
    ayushPatterns: [/pakshaghata/i, /ardhanga/i], // [PLACEHOLDER]
  },
  breathless: {
    reason: "Severe breathlessness -- possible acute respiratory failure or pulmonary embolism.",
    patterns: [/breathless/i, /can.?t\s*breathe/i, /difficulty\s*breath/i, /shortness.*breath/i, /\bsob\b/i],
    ayushPatterns: [/tamaka\s*shwasa/i, /\bshwasa\b/i], // [PLACEHOLDER]
  },
  unconscious: {
    reason: "Altered / loss of consciousness -- requires immediate triage evaluation.",
    patterns: [/unconscious/i, /fainted/i, /not\s*respond/i, /syncope/i, /collapse/i, /loss.*conscious/i],
    ayushPatterns: [/moorcha/i, /murcha/i, /apasmara/i], // [PLACEHOLDER]
  },
  bleeding: {
    reason: "Severe uncontrolled bleeding -- haemodynamic instability risk.",
    patterns: [/bleeding/i, /haemorrhage/i, /hemorrhage/i, /blood\s*loss/i, /coughing\s*blood/i, /vomiting\s*blood/i],
    ayushPatterns: [/raktapitta/i, /rakta\s*srava/i], // [PLACEHOLDER]
  },
  seizure: {
    reason: "Active or post-ictal seizure -- requires urgent neurological assessment.",
    patterns: [/seizure/i, /convulsion/i, /epilep/i, /\bfits\b/i, /post.?ictal/i],
    ayushPatterns: [/akshepaka/i], // [PLACEHOLDER]
  },
  snakebite: {
    reason: "Suspected envenomation -- anti-venom may be time-critical.",
    patterns: [/snake.*bit/i, /bit.*snake/i, /envenomat/i, /scorpion.*sting/i],
    ayushPatterns: [/sarpavisha/i], // [PLACEHOLDER]
  },
  poison: {
    reason: "Suspected poisoning or overdose -- poison control and emergency support needed.",
    patterns: [/poison/i, /overdose/i, /\btoxic\b/i, /organo.*phosphate/i],
    ayushPatterns: [/visha\s*jwara/i, /\bvisha\b/i], // [PLACEHOLDER]
  },
};

/**
 * detectRedFlag(symptomId, chiefComplaint, isAyushMode)
 * Returns { red_flag: boolean, red_flag_reason: string|null }
 */
function detectRedFlag(symptomId, chiefComplaint, isAyushMode = false) {
  // 1. Direct symptom_id match
  if (symptomId && RED_FLAG_RULES[symptomId]) {
    return { red_flag: true, red_flag_reason: RED_FLAG_RULES[symptomId].reason };
  }

  if (!chiefComplaint) return { red_flag: false, red_flag_reason: null };

  // 2. Keyword scan
  for (const rule of Object.values(RED_FLAG_RULES)) {
    const patterns = isAyushMode
      ? [...rule.patterns, ...(rule.ayushPatterns || [])]
      : rule.patterns;
    for (const pat of patterns) {
      if (pat.test(chiefComplaint)) {
        return { red_flag: true, red_flag_reason: rule.reason };
      }
    }
  }

  return { red_flag: false, red_flag_reason: null };
}

module.exports = { RED_FLAG_RULES, detectRedFlag };
