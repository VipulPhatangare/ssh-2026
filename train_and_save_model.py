"""
Train XGBoost on Mukhyamantri Kisan Kalyan Yojana dataset and save model.
Run: python train_and_save_model.py
"""
import warnings; warnings.filterwarnings("ignore")
import json, os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
from xgboost import XGBClassifier
import joblib

CSV  = "mukhyamantri_kisan_kalyan_yojana_dataset.csv"
PKL  = "kisan_approval_model.pkl"
JSON = "kisan_model_features.json"

df = pd.read_csv(CSV)
print(f"Loaded {df.shape[0]:,} rows")

X = df.drop(columns=["approval_status"])
y = df["approval_status"].astype(int)
feature_names = X.columns.tolist()

# ── add realistic noise (same as notebook) ────────────────────────────────
rng = np.random.default_rng(42)
X_noisy = X.copy().astype(float)
for col in X_noisy.columns:
    if X_noisy[col].nunique() > 2:
        noise = rng.normal(0, 0.20 * X_noisy[col].std(), size=len(X_noisy))
        X_noisy[col] += noise
        X_noisy.loc[rng.random(len(X_noisy)) < 0.03, col] = -1
    else:
        flip = rng.random(len(X_noisy)) < 0.04
        X_noisy.loc[flip, col] = 1 - X_noisy.loc[flip, col]

X_train, X_test, y_train, y_test = train_test_split(
    X_noisy, y, test_size=0.20, random_state=42, stratify=y)

spw = round((y_train==0).sum() / (y_train==1).sum(), 4)

model = XGBClassifier(
    n_estimators=400, max_depth=4, learning_rate=0.05,
    min_child_weight=5, gamma=1.0,
    subsample=0.7, colsample_bytree=0.6,
    reg_alpha=0.5, reg_lambda=2.0,
    scale_pos_weight=spw, eval_metric="logloss",
    early_stopping_rounds=30, random_state=42, n_jobs=-1, verbosity=0
)
model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]
acc = accuracy_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_prob)
print(f"Accuracy: {acc:.4f}  |  ROC-AUC: {auc:.4f}")

joblib.dump(model, PKL)
print(f"✅ Model saved  →  {PKL}")

with open(JSON, "w") as f:
    json.dump({"feature_names": feature_names, "n_features": len(feature_names),
               "accuracy": round(acc, 6), "roc_auc": round(auc, 6)}, f, indent=2)
print(f"✅ Features saved  →  {JSON}")
