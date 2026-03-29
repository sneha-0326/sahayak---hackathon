import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
import pickle
import os

BASE = os.path.dirname(__file__)

# ── Load Kaggle dataset ────────────────────────────────────────────────────
kaggle_path = os.path.join(BASE, "data.csv")
kaggle = pd.read_csv(kaggle_path)
# Kaggle columns: Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate, RiskLevel
# Add Q1-Q20 as 0 (unknown) for Kaggle rows
for i in range(1, 21):
    kaggle[f"Q{i}"] = 0

print(f"Kaggle rows: {len(kaggle)}")

# ── Load Synthetic dataset ─────────────────────────────────────────────────
synthetic_path = os.path.join(BASE, "synthetic_data.csv")
if not os.path.exists(synthetic_path):
    print("synthetic_data.csv not found. Run generate_synthetic.py first.")
    exit(1)

synthetic = pd.read_csv(synthetic_path)
print(f"Synthetic rows: {len(synthetic)}")

# ── Combine ────────────────────────────────────────────────────────────────
combined = pd.concat([kaggle, synthetic], ignore_index=True)
print(f"Combined rows: {len(combined)}")
print("Risk distribution:\n", combined["RiskLevel"].value_counts())

# ── Features & Labels ──────────────────────────────────────────────────────
feature_cols = ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"] + \
               [f"Q{i}" for i in range(1, 21)]

X = combined[feature_cols]
y = combined["RiskLevel"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

print("Classes:", le.classes_)

# ── Train ──────────────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"Test Accuracy: {accuracy * 100:.2f}%")

# Cross-validation
cv_scores = cross_val_score(model, X, y_encoded, cv=5)
print(f"Cross-val Accuracy: {cv_scores.mean() * 100:.2f}% ± {cv_scores.std() * 100:.2f}%")

# Feature importance top 10
importances = pd.Series(model.feature_importances_, index=feature_cols)
print("\nTop 10 important features:")
print(importances.nlargest(10))

# ── Save ───────────────────────────────────────────────────────────────────
output = {"model": model, "label_encoder": le, "feature_cols": feature_cols}
with open(os.path.join(BASE, "model.pkl"), "wb") as f:
    pickle.dump(output, f)

print("\nmodel.pkl saved successfully.")
