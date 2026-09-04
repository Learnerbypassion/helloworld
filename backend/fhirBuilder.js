/**
 * MediKiosk — Module D: builds a structurally valid FHIR R4 Bundle
 * (Patient, Encounter, Condition, Observation, MedicationStatement,
 * AllergyIntolerance) from a completed intake session. Ported 1:1 from the
 * Python fhir_builder.py.
 */
function now() {
  return new Date().toISOString();
}

function clean(obj) {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && v !== undefined) out[k] = clean(v);
    }
    return out;
  }
  return obj;
}

function buildFhirBundle(patient, session, documents) {
  const patientId = `patient-${patient.id}`;
  const encounterId = `encounter-${session.id}`;
  const entries = [];

  entries.push({
    fullUrl: `urn:uuid:${patientId}`,
    resource: {
      resourceType: "Patient",
      id: patientId,
      identifier: [{ system: "https://healthid.ndhm.gov.in", value: patient.abha_id || "unlinked" }],
      name: [{ text: patient.name }],
      communication: [{ language: { text: patient.language } }],
    },
  });

  entries.push({
    fullUrl: `urn:uuid:${encounterId}`,
    resource: {
      resourceType: "Encounter",
      id: encounterId,
      status: "in-progress",
      class: { code: "AMB", display: "ambulatory" },
      subject: { reference: `urn:uuid:${patientId}` },
      serviceType: { text: session.ayush_mode ? "AYUSH OPD" : "General OPD" },
      period: { start: session.created_at || now() },
      priority: session.red_flag ? { text: "urgent" } : null,
    },
  });

  if (session.chief_complaint) {
    const condition = {
      resourceType: "Condition",
      id: `condition-${session.id}`,
      clinicalStatus: { coding: [{ code: "active" }] },
      code: { text: session.chief_complaint },
      subject: { reference: `urn:uuid:${patientId}` },
      encounter: { reference: `urn:uuid:${encounterId}` },
      note: (session.hpi_details || []).map((d) => ({ text: d })),
    };
    if (session.red_flag) condition.severity = { text: "severe \u2014 emergency triage flag" };
    entries.push({ fullUrl: `urn:uuid:condition-${session.id}`, resource: condition });
  }

  for (const doc of documents) {
    for (const lab of doc.extracted_labs || []) {
      const obsId = `observation-lab-${doc.id}-${lab.name.replace(/\s+/g, "")}`;
      entries.push({
        fullUrl: `urn:uuid:${obsId}`,
        resource: {
          resourceType: "Observation",
          id: obsId,
          status: "final",
          category: [{ coding: [{ code: "laboratory" }] }],
          code: { text: lab.name },
          subject: { reference: `urn:uuid:${patientId}` },
          encounter: { reference: `urn:uuid:${encounterId}` },
          valueQuantity: { value: lab.value, unit: lab.unit },
          referenceRange: [{ text: lab.ref_range }],
          interpretation: [{ text: lab.abnormal ? "Abnormal" : "Normal" }],
        },
      });
    }
    for (const med of doc.extracted_meds || []) {
      const stmtId = `medstatement-${doc.id}-${med.drug}`;
      entries.push({
        fullUrl: `urn:uuid:${stmtId}`,
        resource: {
          resourceType: "MedicationStatement",
          id: stmtId,
          status: "active",
          subject: { reference: `urn:uuid:${patientId}` },
          medicationCodeableConcept: { text: med.drug },
          dosage: [{ text: `${med.dose} \u2014 ${med.frequency}` }],
        },
      });
    }
  }

  if (session.allergies && !session.allergies.toLowerCase().includes("no known")) {
    entries.push({
      fullUrl: `urn:uuid:allergy-${session.id}`,
      resource: {
        resourceType: "AllergyIntolerance",
        id: `allergy-${session.id}`,
        clinicalStatus: { coding: [{ code: "active" }] },
        patient: { reference: `urn:uuid:${patientId}` },
        code: { text: session.allergies },
      },
    });
  }

  const bundle = {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now(),
    entry: entries,
  };
  return clean(bundle);
}

module.exports = { buildFhirBundle };
