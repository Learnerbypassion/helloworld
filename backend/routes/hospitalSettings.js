/**
 * Hospital Notification & Administrative Settings Routes
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const { Hospital } = require("../db");
const { requireAuth, requireRole } = require("../auth");

// Middleware: ensure admin belongs to this hospital
function ensureHospitalAdmin(req, res, next) {
  const targetHospitalId = req.params.id;
  const userHospitalId = req.user.hospital_id || req.user.id;
  if (userHospitalId !== targetHospitalId) {
    return res.status(403).json({ error: "Access denied: cannot manage settings for another hospital." });
  }
  next();
}

/**
 * GET /api/hospitals/:id/notifications
 */
router.get("/:id/notifications", requireAuth, requireRole("hospital_admin"), ensureHospitalAdmin, async (req, res) => {
  try {
    const hosp = await Hospital.findById(req.params.id);
    if (!hosp) return res.status(404).json({ error: "Hospital not found" });

    return res.json({
      notification_mode: hosp.notification_mode || "call",
      notification_threshold: hosp.notification_threshold || 1,
      notification_message_template: hosp.notification_message_template ||
        "This is an automated call from {hospital_name}. Your consultation with Dr. {doctor_name} is next. Please proceed to the waiting area."
    });
  } catch (err) {
    console.error("[hospitalSettings] GET error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch notification settings" });
  }
});

/**
 * PATCH /api/hospitals/:id/notifications
 */
router.patch("/:id/notifications", requireAuth, requireRole("hospital_admin"), ensureHospitalAdmin, async (req, res) => {
  try {
    const { notification_mode, notification_threshold, notification_message_template } = req.body;
    const updates = {};

    if (notification_mode && ["call", "sms"].includes(notification_mode)) {
      updates.notification_mode = notification_mode;
    }

    if (notification_threshold !== undefined) {
      const parsed = parseInt(notification_threshold, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
        updates.notification_threshold = parsed;
      }
    }

    if (typeof notification_message_template === "string" && notification_message_template.trim()) {
      updates.notification_message_template = notification_message_template.trim();
    }

    const updated = await Hospital.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ error: "Hospital not found" });

    return res.json({
      ok: true,
      notification_mode: updated.notification_mode,
      notification_threshold: updated.notification_threshold,
      notification_message_template: updated.notification_message_template
    });
  } catch (err) {
    console.error("[hospitalSettings] PATCH error:", err);
    return res.status(500).json({ error: err.message || "Failed to update notification settings" });
  }
});

module.exports = router;
