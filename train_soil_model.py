"""Train PRAGYA's local soil-fertility classifier."""
from pathlib import Path
import csv

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
FEATURES = ("N", "P", "K", "ph", "ec", "oc")
with (ROOT / "Data" / "soil_fertility.csv").open(newline="") as stream:
    rows = list(csv.DictReader(stream))
x = np.array([[float(row[key]) for key in FEATURES] for row in rows], dtype=float)
y = np.array([int(row["fertility"]) for row in rows])
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
model = RandomForestClassifier(n_estimators=400, random_state=42, n_jobs=-1, class_weight="balanced")
model.fit(x_train, y_train)
score = model.score(x_test, y_test)
(ROOT / "models").mkdir(exist_ok=True)
joblib.dump(model, ROOT / "models" / "soil_fertility.joblib")
print(f"Saved soil-fertility model. Held-out accuracy: {score:.2%}")
