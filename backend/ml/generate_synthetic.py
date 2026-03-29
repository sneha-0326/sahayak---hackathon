import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 1000  # synthetic samples

# Q1-Q20 mapped to fistula risk weights
# Higher weight = stronger indicator of fistula
QUESTION_WEIGHTS = [
    0.9,  # Q1:  continuous dripping urine through birth canal
    0.9,  # Q2:  dripping all day and night
    0.85, # Q3:  leaks wetting clothing day and night
    0.7,  # Q4:  sudden leakage of large amounts
    0.75, # Q5:  leakage NOT during coughing/sneezing
    0.75, # Q6:  leakage without urge
    0.8,  # Q7:  leaks when asleep
    0.7,  # Q8:  leaks for no obvious reason
    0.9,  # Q9:  feces passing through birth canal
    0.8,  # Q10: fecal leakage from anus
    0.7,  # Q11: long/difficult labor >12 hours
    0.65, # Q12: delivered at home without trained attendant
    0.6,  # Q13: below 18 at first delivery
    0.6,  # Q14: stillbirth history
    0.5,  # Q15: C-section or forceps delivery
    0.5,  # Q16: urine loss during coughing/sneezing
    0.55, # Q17: strong sudden urge before leaking
    0.7,  # Q18: avoided social gatherings due to smell/wetness
    0.65, # Q19: uses extra cloths/pads for wetness
    0.6,  # Q20: burning/soreness in private area
]

def generate_answers(risk_level):
    """Generate realistic yes/sometimes/no answers based on risk level."""
    answers = []
    for weight in QUESTION_WEIGHTS:
        r = np.random.random()
        if risk_level == "high":
            # High risk: mostly yes for high-weight questions
            if r < weight * 0.85:
                answers.append(2)  # yes
            elif r < weight * 0.85 + 0.1:
                answers.append(1)  # sometimes
            else:
                answers.append(0)  # no
        elif risk_level == "mid risk":
            # Medium risk: mix of yes/sometimes
            if r < weight * 0.4:
                answers.append(2)
            elif r < weight * 0.4 + weight * 0.3:
                answers.append(1)
            else:
                answers.append(0)
        else:
            # Low risk: mostly no
            if r < weight * 0.1:
                answers.append(2)
            elif r < weight * 0.1 + weight * 0.15:
                answers.append(1)
            else:
                answers.append(0)
    return answers

def generate_vitals(risk_level):
    """Generate realistic vitals based on risk level."""
    if risk_level == "high":
        age        = np.random.randint(14, 35)
        systolicBP = np.random.randint(130, 170)
        diastolicBP= np.random.randint(85, 110)
        bs         = round(np.random.uniform(8.0, 15.0), 1)
        bodyTemp   = round(np.random.uniform(99.0, 103.0), 1)
        heartRate  = np.random.randint(90, 120)
    elif risk_level == "mid risk":
        age        = np.random.randint(18, 45)
        systolicBP = np.random.randint(110, 140)
        diastolicBP= np.random.randint(70, 90)
        bs         = round(np.random.uniform(6.0, 9.5), 1)
        bodyTemp   = round(np.random.uniform(97.5, 100.0), 1)
        heartRate  = np.random.randint(70, 95)
    else:
        age        = np.random.randint(20, 55)
        systolicBP = np.random.randint(90, 120)
        diastolicBP= np.random.randint(60, 80)
        bs         = round(np.random.uniform(4.0, 7.0), 1)
        bodyTemp   = round(np.random.uniform(97.0, 98.9), 1)
        heartRate  = np.random.randint(60, 80)
    return age, systolicBP, diastolicBP, bs, bodyTemp, heartRate

rows = []
# 40% high, 35% mid, 25% low
distribution = (
    ["high"] * 400 +
    ["mid risk"] * 350 +
    ["low risk"] * 250
)
np.random.shuffle(distribution)

for risk in distribution:
    age, sbp, dbp, bs, temp, hr = generate_vitals(risk)
    answers = generate_answers(risk)
    row = [age, sbp, dbp, bs, temp, hr] + answers + [risk]
    rows.append(row)

q_cols = [f"Q{i+1}" for i in range(20)]
cols = ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"] + q_cols + ["RiskLevel"]

df = pd.DataFrame(rows, columns=cols)
out_path = os.path.join(os.path.dirname(__file__), "synthetic_data.csv")
df.to_csv(out_path, index=False)
print(f"Generated {len(df)} synthetic rows → synthetic_data.csv")
print(df["RiskLevel"].value_counts())
