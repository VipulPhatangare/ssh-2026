"""
Mukhyamantri Kisan Kalyan Yojana — Approval Prediction Microservice
Run:  python prediction_server.py
Port: 5001

POST /predict    → returns approval probability
GET  /health     → health check
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, numpy as np, os

# ── Boot ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "kisan_approval_model.pkl")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found at {MODEL_PATH}. "
        "Run train_and_save_model.py first."
    )

model = joblib.load(MODEL_PATH)
print(f"✅ Model loaded from {MODEL_PATH}")

# Feature order MUST match the training CSV column order (excluding target)
FEATURE_ORDER = [
    "age", "gender", "category", "district",
    "rural_flag", "is_mp_resident",
    "aadhaar_valid", "mobile_linked_aadhaar", "bank_linked_aadhaar",
    "land_registered", "land_area_hectare",
    "land_record_verified", "land_dispute_flag",
    "pm_kisan_registered", "pm_kisan_active",
    "pm_kisan_installment_received", "pm_kisan_rejected_flag",
    "bank_account_valid", "ifsc_valid", "dbt_enabled",
    "previous_dbt_failure",
    "aadhaar_uploaded", "domicile_uploaded", "land_doc_uploaded",
    "bank_passbook_uploaded", "pm_kisan_proof_uploaded",
    "documents_complete",
]

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "kisan_approval_model", "features": len(FEATURE_ORDER)})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON body"}), 400

        # Build feature vector in correct order; default missing → 0
        features = np.array([[float(data.get(f, 0)) for f in FEATURE_ORDER]])

        prob    = float(model.predict_proba(features)[0][1])
        pct     = round(prob * 100, 2)
        approved = prob >= 0.5

        if prob >= 0.80:
            confidence = "High"
            message    = "Strong chance of approval. Ensure all documents are in order."
        elif prob >= 0.60:
            confidence = "Medium-High"
            message    = "Good chance of approval. Review any missing documents."
        elif prob >= 0.40:
            confidence = "Medium"
            message    = "Moderate chance. Consider completing all document uploads."
        elif prob >= 0.20:
            confidence = "Medium-Low"
            message    = "Low chance. Several eligibility criteria may not be met."
        else:
            confidence = "Low"
            message    = "Low chance of approval. Please verify all eligibility conditions."

        return jsonify({
            "probability"  : pct,
            "approved"     : approved,
            "confidence"   : confidence,
            "message"      : message,
            "raw_prob"     : prob,
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Prediction server running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
