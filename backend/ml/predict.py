from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)

model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(model_path, "rb") as f:
    saved = pickle.load(f)

model = saved["model"]
le = saved["label_encoder"]
feature_cols = saved["feature_cols"]

def answer_to_score(ans):
    a = str(ans).strip().lower()
    if a == "yes":   return 2
    if a == "sometimes": return 1
    return 0

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ML API running"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    required = ["age", "systolicBP", "diastolicBP", "bloodSugar", "bodyTemp", "heartRate"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        # Convert answers list to Q1-Q20 scores
        answers = data.get("answers", [])
        q_scores = [answer_to_score(a) for a in answers]
        # Pad to 20 if fewer answers provided
        while len(q_scores) < 20:
            q_scores.append(0)
        q_scores = q_scores[:20]

        features = [[
            float(data["age"]),
            float(data["systolicBP"]),
            float(data["diastolicBP"]),
            float(data["bloodSugar"]),
            float(data["bodyTemp"]),
            float(data["heartRate"]),
            *q_scores
        ]]

        prediction = model.predict(features)[0]
        risk_label = le.inverse_transform([prediction])[0].lower()

        # Normalize to low/medium/high
        if "high" in risk_label:
            risk = "high"
        elif "mid" in risk_label or "medium" in risk_label:
            risk = "medium"
        else:
            risk = "low"

        # Symptom score summary
        symptom_score = sum(q_scores)

        return jsonify({
            "risk": risk,
            "ml_risk": risk_label,
            "symptom_score": symptom_score
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
