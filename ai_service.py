"""
FABRIX AI - Model Inference Microservice
Tugas TUNGGAL: terima fitur hasil scan dari Node.js, return prediksi kualitas dari XGBoost.
Tidak ada logic Roboflow di sini sama sekali -- itu urusan Node.js (yoloService.js).
"""

import os
import json
import xgboost as xgb
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="FABRIX AI - Model Inference Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

quality_model = xgb.XGBClassifier()
quality_model.load_model(os.path.join(BASE_DIR, "fabric_quality_model.json"))

feature_cols = joblib.load(os.path.join(BASE_DIR, "feature_cols.pkl"))
target_encoder = joblib.load(os.path.join(BASE_DIR, "target_encoder.pkl"))

INSIGHTS_PATH = os.path.join(BASE_DIR, "insights.json")

class PredictRequest(BaseModel):
    jumlah_defect: int


@app.get("/")
def root():
    return {"status": "ok", "message": "FABRIX AI Model Inference Service is running"}


@app.post("/predict-quality")
def predict_quality(payload: PredictRequest):
    """
    Prediksi kategori kualitas kain dari fitur yang tersedia hasil scan.

    CATATAN JUJUR: model ini dilatih dengan 17 fitur (GSM, tensile strength, dll)
    yang sebagian besar TIDAK tersedia dari hasil scan YOLO (karena tidak ada input
    manual). Untuk endpoint ini, hanya 'jumlah_defect' yang benar-benar berasal dari
    data real hasil scan -- fitur lain diisi nilai default/median dataset training.
    Artinya prediksi ini punya keterbatasan akurasi; gunakan sebagai insight
    pendukung, bukan keputusan mutlak.
    """
    # Susun input sesuai urutan feature_cols yang dipakai saat training.
    # Fitur yang tidak tersedia dari scan diisi nilai netral/default.
    default_values = {
        "thread_count": 200,
        "gsm": 200,
        "tensile_strength": 60,
        "shrinkage_percent": 3,
        "color_fastness": 3,
        "fabric_thickness": 1,
        "elongation_percent": 15,
        "moisture_absorption": 10,
        "fabric_type": 0,
        "weave_type": 0,
        "finish_type": 0,
        "production_method": 0,
        "inspection_time_minutes": 10,
        "inspection_shift": 0,
        "machine_temperature": 25,
        "humidity_level": 50,
    }

    input_row = []
    for col in feature_cols:
        if col == "defect_count":
            input_row.append(payload.jumlah_defect)
        else:
            input_row.append(default_values.get(col, 0))

    probs = quality_model.predict_proba([input_row])[0]
    pred_class_idx = probs.argmax()
    pred_class_label = target_encoder.inverse_transform([pred_class_idx])[0]
    confidence = float(probs[pred_class_idx])

    return {
        "predicted_quality": pred_class_label,
        "confidence": round(confidence, 3),
        "disclaimer": "Prediksi hanya berbasis jumlah defect (fitur lain memakai nilai default dataset), gunakan sebagai insight pendukung.",
    }


@app.get("/insights")
def get_insights():
    """Return feature importance statis dari model yang sudah dilatih."""
    if not os.path.exists(INSIGHTS_PATH):
        raise HTTPException(status_code=404, detail="insights.json belum ada")

    with open(INSIGHTS_PATH, "r") as f:
        return json.load(f)