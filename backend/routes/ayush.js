/**
 * MediKiosk -- AYUSH Dashavidha Pariksha Question API
 *
 * GET /api/ayush/questions -> array of 10 guided MCQ questions
 *
 * Future: move to MongoDB collection for doctor-authored question text
 * via admin UI, enabling updates without redeployment.
 */
const express = require("express");
const router  = express.Router();

const DASHAVIDHA_QUESTIONS = [
  {
    field: "prakriti",
    label: "Prakriti (Body Constitution)",
    question: "What best describes your natural body type and temperament?",
    options: ["Vata (Thin, energetic, anxious)", "Pitta (Medium, intense, sharp)", "Kapha (Heavy, calm, steady)", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic / Don't Know"],
  },
  {
    field: "vikriti",
    label: "Vikriti (Current Imbalance)",
    question: "Have you noticed recent changes from your usual state?",
    options: ["Restlessness / Dryness / Anxiety (Vata)", "Inflammation / Irritability / Heat (Pitta)", "Heaviness / Congestion / Fatigue (Kapha)", "Multiple changes", "No noticeable change"],
  },
  {
    field: "agni",
    label: "Agni (Digestive Fire)",
    question: "How is your digestion currently?",
    options: ["Normal -- digests well, no discomfort", "Irregular -- sometimes strong, sometimes weak", "Weak -- heavy after meals, bloating", "Sharp -- very hungry, acid reflux"],
  },
  {
    field: "koshtha",
    label: "Koshtha (Bowel Habit)",
    question: "How are your bowel movements?",
    options: ["Regular once daily", "Irregular / Sometimes constipated", "Loose / Frequent", "Hard stool / Chronic constipation"],
  },
  {
    field: "satmya",
    label: "Satmya (Habitual Diet / Adaptability)",
    question: "Which foods do you regularly eat and tolerate well?",
    options: ["Vegetarian -- light foods", "Non-vegetarian -- mixed diet", "Spicy / Oily foods", "Raw / Cold foods", "Multiple intolerances"],
  },
  {
    field: "sara",
    label: "Sara (Tissue Quality)",
    question: "How would you describe your physical build and tissue quality?",
    options: ["Excellent -- strong, well-nourished", "Average -- moderate strength", "Poor -- easily fatigued, thin"],
  },
  {
    field: "samhanana",
    label: "Samhanana (Body Compactness)",
    question: "How is your body frame / muscle compactness?",
    options: ["Well-built / Compact", "Average", "Loose / Frail"],
  },
  {
    field: "ahara_shakti",
    label: "Ahara Shakti (Appetite)",
    question: "How would you describe your appetite?",
    options: ["Strong -- large portions", "Moderate -- average portions", "Weak -- small portions, easily full"],
  },
  {
    field: "vyayama_shakti",
    label: "Vyayama Shakti (Exercise Tolerance)",
    question: "How much physical activity can you comfortably perform?",
    options: ["High -- vigorous exercise daily", "Moderate -- light activity", "Low -- tires quickly with minimal exertion"],
  },
  {
    field: "vaya",
    label: "Vaya (Life Stage)",
    question: "Which life stage applies to you?",
    options: ["Bala (Child / Adolescent up to 16)", "Madhya (Adult / Middle age 16-60)", "Vriddha (Senior / Elderly 60+)"],
  },
];

router.get("/questions", (req, res) => {
  res.json(DASHAVIDHA_QUESTIONS);
});

module.exports = router;
