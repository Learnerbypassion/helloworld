/**
 * Receptionist Interface — Shared hospital-wide vitals queue.
 *
 * All routes require authentication with role "receptionist".
 *
 * Hospital scoping: IntakeSession has a direct `hospital_id` field
 * (confirmed from db.js line 138), so no Patient join is needed for
 * the queue query.
 *
 * Concurrency model:
 *   - One atomic findOneAndUpdate per state-changing operation (claim, release, save).
 *   - No read-then-write anywhere in this file.
 *   - Stale claim expiry (STALE_CLAIM_MS) allows recovery from crashes / abandoned forms.
 */

const express = require("express");
const { IntakeSession, Receptionist } = require("../db");
const { requireAuth, requireRole } = require("../auth");

const router = express.Router();

// Stale-claim window: if a receptionist opened the vitals form but never
// saved or released (e.g. browser crash), the claim is considered abandoned
// after this many milliseconds, allowing any other receptionist to reclaim.
const STALE_CLAIM_MS = 3 * 60 * 1000; // 3 minutes

// ─── GET /api/receptionist/queue ─────────────────────────────────────────────
//
// Returns all submitted sessions whose vitals are not yet recorded, scoped to
// the logged-in receptionist's hospital via IntakeSession.hospital_id (direct
// field — confirmed present in db.js).
//
// Sort: red-flag patients first (emergency triage), then FIFO by submission
// time — matches the doctor queue convention in routes/doctor.js line 143.
//
// Each entry includes vitals_status, and when "in_progress", the claiming
// receptionist's name and claimed_at timestamp so every station can render
// the "Being handled by [name]" banner.

router.get(
  "/queue",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const hospId = req.user.hospital_id;

      const sessions = await IntakeSession.find({
        hospital_id: hospId,
        status: "submitted",
        vitals_status: { $ne: "recorded" },
      }).sort({ red_flag: -1, submitted_at: 1 });

      // Resolve claiming receptionist names for in_progress entries.
      // Collect unique claimer IDs to batch-fetch in one query.
      const claimerIds = [
        ...new Set(
          sessions
            .filter(
              (s) =>
                s.vitals_status === "in_progress" && s.vitals_claimed_by
            )
            .map((s) => s.vitals_claimed_by.toString())
        ),
      ];

      const claimerMap = new Map();
      if (claimerIds.length > 0) {
        const recs = await Receptionist.find({
          _id: { $in: claimerIds },
        }).select("name");
        recs.forEach((r) => claimerMap.set(r.id, r.name));
      }

      const results = sessions.map((s) => {
        const entry = {
          id: s.id,
          session_id: s.id,
          patient_id: s.patient_id,
          token: s.token,
          chief_complaint: s.chief_complaint,
          red_flag: !!s.red_flag,
          red_flag_reason: s.red_flag_reason,
          submitted_at: s.submitted_at,
          vitals_status: s.vitals_status || "pending",
        };

        if (s.vitals_status === "in_progress" && s.vitals_claimed_by) {
          const claimerId = s.vitals_claimed_by.toString();
          entry.vitals_claimed_by = claimerId;
          entry.vitals_claimed_by_name =
            claimerMap.get(claimerId) || "Another receptionist";
          entry.vitals_claimed_at = s.vitals_claimed_at;
        }

        return entry;
      });

      res.json(results);
    } catch (err) {
      res
        .status(500)
        .json({ error: err.message || "Failed to fetch vitals queue" });
    }
  }
);

// ─── POST /api/receptionist/sessions/:id/vitals/claim ────────────────────────
//
// Atomically marks a session as "in_progress" for the requesting receptionist.
//
// The query condition allows claiming only if:
//   (a) vitals_status is "pending"  — nobody has started yet, OR
//   (b) vitals_status is "in_progress" AND the existing claim is older than
//       STALE_CLAIM_MS — previous receptionist abandoned the form.
//
// If the condition doesn't match (already actively claimed by someone else),
// MongoDB returns null and we respond with 409 Conflict.
//
// Frontend must call this the moment the vitals form is opened, NOT on save.

router.post(
  "/sessions/:id/vitals/claim",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const staleThreshold = new Date(Date.now() - STALE_CLAIM_MS);

      const session = await IntakeSession.findOneAndUpdate(
        {
          _id: req.params.id,
          $or: [
            { vitals_status: "pending" },
            { vitals_status: { $exists: false } }, // sessions created before schema change
            { vitals_status: null },                // also catch explicit null
            {
              vitals_status: "in_progress",
              vitals_claimed_at: { $lt: staleThreshold },
            },
            {
              vitals_status: "in_progress",
              vitals_claimed_by: req.user.id,
            },
          ],
        },
        {
          $set: {
            vitals_status: "in_progress",
            vitals_claimed_by: req.user.id,
            vitals_claimed_at: new Date(),
          },
        },
        { new: true }
      );

      if (!session) {
        return res.status(409).json({
          error: "Already being handled by another receptionist",
        });
      }

      res.json({ ok: true, vitals_status: session.vitals_status });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to claim session" });
    }
  }
);

// ─── POST /api/receptionist/sessions/:id/vitals/release ──────────────────────
//
// Releases an in-progress claim back to "pending", but only if the requesting
// receptionist is the current claimer. Prevents one receptionist from
// accidentally releasing another's active session.
//
// Called when the vitals form is cancelled/closed without saving.

router.post(
  "/sessions/:id/vitals/release",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const session = await IntakeSession.findOneAndUpdate(
        {
          _id: req.params.id,
          vitals_claimed_by: req.user.id,
        },
        {
          $set: {
            vitals_status: "pending",
            vitals_claimed_by: null,
            vitals_claimed_at: null,
          },
        },
        { new: true }
      );

      if (!session) {
        return res.status(403).json({
          error:
            "Cannot release: you are not the current claimer of this session",
        });
      }

      res.json({ ok: true, vitals_status: "pending" });
    } catch (err) {
      res
        .status(500)
        .json({ error: err.message || "Failed to release session" });
    }
  }
);

// ─── PATCH /api/receptionist/sessions/:id/vitals ─────────────────────────────
//
// Saves recorded vitals. The query condition requires BOTH:
//   - vitals_status === "in_progress"  (session still open)
//   - vitals_claimed_by === req.user.id  (this receptionist still holds the claim)
//
// This is a single atomic findOneAndUpdate — no prior read or separate if-check.
// If the condition doesn't match (claim expired, stolen, or already recorded),
// we return 409 with a clear human-readable message.
//
// On success: sets all vitals fields, vitals_status -> "recorded",
// recorded_by, recorded_at, and clears the claim fields atomically.

router.patch(
  "/sessions/:id/vitals",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const {
        temperature,
        bp_systolic,
        bp_diastolic,
        pulse,
        spo2,
        weight,
      } = req.body;

      const session = await IntakeSession.findOneAndUpdate(
        {
          _id: req.params.id,
          vitals_status: "in_progress",
          vitals_claimed_by: req.user.id,
        },
        {
          $set: {
            "vitals.temperature": temperature ?? null,
            "vitals.bp_systolic": bp_systolic ?? null,
            "vitals.bp_diastolic": bp_diastolic ?? null,
            "vitals.pulse": pulse ?? null,
            "vitals.spo2": spo2 ?? null,
            "vitals.weight": weight ?? null,
            "vitals.recorded_by": req.user.id,
            "vitals.recorded_at": new Date(),
            vitals_status: "recorded",
            vitals_claimed_by: null,
            vitals_claimed_at: null,
          },
        },
        { new: true }
      );

      if (!session) {
        return res.status(409).json({
          error:
            "Your claim expired or was taken — please try again",
        });
      }

      res.json({ ok: true, vitals_status: "recorded" });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to save vitals" });
    }
  }
);

module.exports = router;
