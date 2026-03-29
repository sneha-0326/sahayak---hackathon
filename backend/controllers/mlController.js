const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const ML_API = process.env.ML_API || "http://localhost:5000";

exports.predictRisk = async (req, res) => {
  try {
    const { age, systolicBP, diastolicBP, bloodSugar, bodyTemp, heartRate, answers } = req.body;

    const response = await fetch(`${ML_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age, systolicBP, diastolicBP, bloodSugar, bodyTemp, heartRate, answers: answers || [] })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ message: "ML API error", error: data });
    }

    res.json(data);
  } catch (error) {
    console.error("ML prediction error:", error);
    res.status(500).json({ message: "Could not reach ML service", error: error.message });
  }
};
