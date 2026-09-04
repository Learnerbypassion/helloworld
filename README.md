# MediKiosk — Node.js / JavaScript rewrite

This is a full rewrite of the original Python/FastAPI MediKiosk prototype into
**JavaScript end-to-end**: a Node.js/Express + SQLite backend, and a vanilla-JS
frontend. It adds **role-based authentication** (Hospital Admin / Doctor /
Patient) and the features described in `Hospital_Interface.docx`.

## What's new vs. the original prototype

| Area | Before (Python) | Now (JavaScript) |
|---|---|---|
| Backend | FastAPI + SQLAlchemy | Express + better-sqlite3 |
| Auth | None — anyone could hit any endpoint | JWT-based, 3 roles: `hospital_admin`, `doctor`, `patient` |
| Hospital | n/a | Register hospital (name, registration no., type, phone, email, city/state/PIN, address, HFR/ABDM ID) |
| Doctors | n/a | Add doctor (name, HPR ID, Aadhar ID, DOB, address, type), remove doctor, doctor login |
| Patients | Create-only, no auth | Add patient, find patient (by phone), update patient, patient portal login |
| Doctor console | Queue + generic review | Dashboard/queue, patient's current medicine records, review tabbed as **Profile / Reports / Diagnosis / Case / Prescribing** (per the docx sketch) |
| Patient console | n/a (kiosk only) | Patient portal: Profile / Reports / Diagnosis / Case tabs, "New visit" kiosk flow, self-service "Update patient" |
| OCR | pytesseract (needs system Tesseract binary) | `tesseract.js` (pure JS, no native install) |
| FHIR bundle, red-flag triage, med/lab extraction | Python | Ported 1:1 to JavaScript, same behavior |

## Project layout

```
medikiosk-js/
├── backend/
│   ├── server.js         Express app entrypoint
│   ├── db.js              better-sqlite3 connection + schema
│   ├── auth.js             JWT signing + requireAuth/requireRole middleware
│   ├── extract.js          Rule-based medication/lab extraction (ported)
│   ├── ocr.js               tesseract.js OCR wrapper
│   ├── fhirBuilder.js        FHIR R4 bundle builder (ported)
│   ├── routes/
│   │   ├── auth.js            Hospital register/login, doctor add/remove/login, patient login
│   │   ├── patients.js        Add/find/update patient
│   │   ├── intake.js           Kiosk session flow (symptom, HPI, AYUSH, parameters, docs, submit)
│   │   └── doctor.js            Queue, medicine records, review
│   └── package.json
└── frontend/
    ├── index.html          Shell
    ├── app.js               All views/routing (vanilla JS, fetch-based)
    └── styles.css
```

## Roles

- **hospital_admin** — registers the hospital, adds/removes doctors, adds/finds patients.
- **doctor** — logs in, sees the submitted-patient queue, views a patient's
  current medicine records, and reviews a visit across five tabs (Profile,
  Reports, Diagnosis, Case, Prescribing) matching the handwritten UI sketch
  in the docx.
- **patient** — logs in with phone + the password set at registration; can
  view/update their own profile, see reports/diagnosis/case once reviewed,
  and start a new kiosk visit (symptom pick, optional document photo → OCR,
  PMH/allergies, submit to the doctor's queue).

Every protected route checks both the JWT and that the resource belongs to
the caller's hospital (or, for patients, to themselves) — see `assertAccess`
in `intake.js` and the checks in `patients.js`.

## Running it

**1. Backend**

```bash
cd backend
npm install
npm start          # listens on http://localhost:8000 by default
```

Check `http://localhost:8000/api/health`.

> `tesseract.js` downloads its English language data on first OCR call and
> caches it locally — this needs outbound internet access once. All other
> functionality works fully offline.

**2. Frontend**

```bash
cd frontend
python3 -m http.server 5500      # or any static file server
```

Visit `http://localhost:5500`. It talks to the backend at
`http://localhost:8000` by default — to point it elsewhere, set
`window.MEDIKIOSK_API_BASE` in `index.html` before `app.js` loads.

**3. Try the flow**

1. **Hospital** → Register a hospital → you're logged in as `hospital_admin`.
2. Add a doctor (Doctors tab) and a patient (Patients tab, with a portal
   password so the patient can log in later).
3. Log out, log back in as **Patient** (phone + password) → "New visit"
   tab → pick a symptom (try "Chest Pain / Breathless" to see the real
   server-side red-flag rule fire) → optionally upload a prescription/lab
   photo → submit.
4. Log out, log in as **Doctor** with the email/password you added →
   the patient appears in the Dashboard queue → click them → walk through
   Profile / Reports / Diagnosis / Case / Prescribing, save each tab.

## Still stand-ins (same caveats as the original prototype)

- ABHA ID is format-validated only — no real ABDM sandbox call.
- Medication/lab extraction is rule-based (regex + known-drug list), not a
  trained clinical NER model.
- Speech-to-text/text-to-speech (Web Speech API in the browser) was in the
  original single-file kiosk UI; the rewritten frontend focuses on the
  role-based flows above and doesn't re-wire that piece — it's a
  straightforward addition to `app.js`'s "New visit" tab if you need it back.
