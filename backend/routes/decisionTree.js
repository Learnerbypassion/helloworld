/**
 * Hospital Decision Tree & Question Parameters Routes
 * Allows hospital admins to configure symptom question parameters.
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const { SymptomDecisionTree, ClinicalQuestion } = require("../db");
const { requireAuth, requireRole } = require("../auth");

// Middleware: ensure user belongs to the target hospital
function ensureHospitalAccess(req, res, next) {
  const targetHospitalId = req.params.id;
  const userHospitalId = req.user.hospital_id || req.user.id;
  if (userHospitalId !== targetHospitalId) {
    return res.status(403).json({ error: "Access denied: cannot manage decision trees for another hospital." });
  }
  next();
}

/**
 * GET /api/hospitals/:id/decision-trees
 * List all configured decision trees for this hospital
 */
router.get("/:id/decision-trees", requireAuth, requireRole("hospital_admin"), ensureHospitalAccess, async (req, res) => {
  try {
    const trees = await SymptomDecisionTree.find({ hospital_id: req.params.id, active: true }).sort({ updatedAt: -1 });
    return res.json({ trees });
  } catch (err) {
    console.error("[decisionTree] List error:", err);
    return res.status(500).json({ error: err.message || "Failed to retrieve decision trees" });
  }
});

/**
 * POST /api/hospitals/:id/decision-trees
 * Create or update symptom question parameters for this hospital.
 * Automatically invalidates stale cached ClinicalQuestion entries for this hospital + symptom.
 */
router.post("/:id/decision-trees", requireAuth, requireRole("hospital_admin"), ensureHospitalAccess, async (req, res) => {
  try {
    const hospital_id = req.params.id;
    const { symptom_key, parameters } = req.body;

    if (!symptom_key || typeof symptom_key !== "string" || !symptom_key.trim()) {
      return res.status(400).json({ error: "symptom_key is required." });
    }

    if (!Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({ error: "parameters array is required and must not be empty." });
    }

    const cleanSymptomKey = symptom_key.toLowerCase().trim();

    // Sanitize parameters
    const cleanParams = parameters.map(p => ({
      label: (p.label || "").trim(),
      type: ["yes_no", "scale", "chips", "text"].includes(p.type) ? p.type : "yes_no",
      options: Array.isArray(p.options)
        ? p.options.map(opt => String(opt).trim()).filter(Boolean)
        : typeof p.options === "string"
        ? p.options.split(",").map(opt => opt.trim()).filter(Boolean)
        : []
    })).filter(p => p.label.length > 0);

    if (cleanParams.length === 0) {
      return res.status(400).json({ error: "At least one valid parameter with a label is required." });
    }

    // 1. Invalidate stale cached questions for this hospital and symptom (create or update)
    const deletedCount = await ClinicalQuestion.deleteMany({
      hospital_id,
      symptom_key: cleanSymptomKey,
    });
    console.log(`[decisionTree] Invalidated ${deletedCount.deletedCount} cached questions for ${hospital_id}::${cleanSymptomKey}`);

    // 2. Upsert decision tree
    const tree = await SymptomDecisionTree.findOneAndUpdate(
      { hospital_id, symptom_key: cleanSymptomKey },
      {
        hospital_id,
        symptom_key: cleanSymptomKey,
        parameters: cleanParams,
        active: true,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Decision tree saved successfully. Stale question caches invalidated.",
      tree,
    });
  } catch (err) {
    console.error("[decisionTree] Save error:", err);
    return res.status(500).json({ error: err.message || "Failed to save decision tree" });
  }
});

/**
 * DELETE /api/hospitals/:id/decision-trees/:treeId
 * Remove a symptom decision tree and clear its cached questions
 */
router.delete("/:id/decision-trees/:treeId", requireAuth, requireRole("hospital_admin"), ensureHospitalAccess, async (req, res) => {
  try {
    const hospital_id = req.params.id;
    const { treeId } = req.params;

    const tree = await SymptomDecisionTree.findOne({ _id: treeId, hospital_id });
    if (!tree) {
      return res.status(404).json({ error: "Decision tree not found for this hospital." });
    }

    const symptom_key = tree.symptom_key;
    await SymptomDecisionTree.deleteOne({ _id: treeId });

    // Invalidate cached questions for this symptom at this hospital
    await ClinicalQuestion.deleteMany({ hospital_id, symptom_key });

    return res.json({ message: "Decision tree removed and cached questions cleared." });
  } catch (err) {
    console.error("[decisionTree] Delete error:", err);
    return res.status(500).json({ error: err.message || "Failed to delete decision tree" });
  }
});

module.exports = router;
