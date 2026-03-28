const Screening = require("../models/Screening");

/**
 * Convert answer string to numeric score:
 * yes -> 2, sometimes -> 1, no -> 0
 */
function answerToScore(answer) {
  if (!answer || typeof answer !== "string") return 0;
  const norm = answer.trim().toLowerCase();
  if (norm === "yes") return 2;
  if (norm === "sometimes") return 1;
  return 0;
}

/**
 * Convert total score to risk level.
 * These thresholds are simple and can be tuned.
 */
function scoreToRisk(score) {
  if (score >= 14) return "high";  // e.g., 7+ yes in 7 questions
  if (score >= 7) return "medium";
  return "low";
}

exports.calculateRisk = (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    const score = answers.reduce((sum, v) => sum + answerToScore(v), 0);
    const risk = scoreToRisk(score);

    res.json({ score, risk });
  } catch (error) {
    console.error("Error calculating risk", error);
    res.status(500).json({ message: "Error calculating risk", error: error.message });
  }
};

exports.syncScreening = async (req, res) => {
  try {
    const { answers, mode, risk } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    if (!["voice", "text"].includes(mode)) {
      return res.status(400).json({ message: "mode must be 'voice' or 'text'" });
    }

    if (!["low", "medium", "high"].includes(risk)) {
      return res.status(400).json({ message: "risk must be 'low', 'medium', or 'high'" });
    }

    const screening = new Screening({ answers, mode, risk });
    await screening.save();

    res.status(201).json({ message: "Screening synced", screening });
  } catch (error) {
    console.error("Error syncing screening", error);
    res.status(500).json({ message: "Error syncing screening", error: error.message });
  }
};
