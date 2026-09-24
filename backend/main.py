import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.schemas import (
    PredictionRequest, PredictionResponse,
    InsightsResponse, DataPoint, HealthTip,
    ModelAnalyticsResponse, ModelMetric, FeatureImportanceItem
)

app = FastAPI(
    title="Cardio Care API",
    description="REST API for Cardiovascular Health Risk Assessment & Data Insights",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model", "cardio_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "cardio_data.csv")

# Global instances
model = None
scaler = None
lr_model = None
ada_model = None

FEATURE_NAMES = ['age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active']

@app.on_event("startup")
def load_ml_assets():
    global model, scaler, lr_model, ada_model
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            print("GradientBoosting Model and Scaler loaded successfully!")
        else:
            print("Warning: Model or Scaler file not found. Predictions will raise an error.")

        lr_path = os.path.join(BASE_DIR, "model", "logistic_model.pkl")
        if os.path.exists(lr_path):
            lr_model = joblib.load(lr_path)
            print("Logistic Regression Model loaded successfully!")

        ada_path = os.path.join(BASE_DIR, "model", "adaboost_model.pkl")
        if os.path.exists(ada_path):
            ada_model = joblib.load(ada_path)
            print("AdaBoost Model loaded successfully!")
    except Exception as e:
        print(f"Error loading ML assets: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Cardio Care API",
        "model_loaded": model is not None and scaler is not None,
        "models_available": ["Gradient Boosting", "Logistic Regression", "AdaBoost"],
        "model_type": "Multi-Model Classifier Suite",
        "accuracy": "91.6%",
        "f1_score": "91.5%"
    }

@app.post("/api/predict", response_model=PredictionResponse)
def predict_cardio_risk(req: PredictionRequest):
    if scaler is None:
        raise HTTPException(status_code=500, detail="ML scaler not loaded on server.")
    
    # Model routing
    model_key = (req.model or "gradient_boosting").lower().replace(" ", "_").replace("-", "_")
    MODEL_MAP = {
        "gradient_boosting": (model, "Gradient Boosting"),
        "gradientboosting": (model, "Gradient Boosting"),
        "gb": (model, "Gradient Boosting"),
        "logistic_regression": (lr_model, "Logistic Regression"),
        "logisticregression": (lr_model, "Logistic Regression"),
        "lr": (lr_model, "Logistic Regression"),
        "adaboost": (ada_model, "AdaBoost"),
        "ada_boost": (ada_model, "AdaBoost"),
        "ada": (ada_model, "AdaBoost"),
    }
    
    chosen_tuple = MODEL_MAP.get(model_key)
    if chosen_tuple is None or chosen_tuple[0] is None:
        # Fallback to default model if requested is not loaded
        chosen_model = model
        model_display = "Gradient Boosting"
    else:
        chosen_model, model_display = chosen_tuple

    if chosen_model is None:
        raise HTTPException(status_code=500, detail="Requested ML model is not available.")
    
    # Calculate BMI
    height_m = req.height / 100.0
    bmi = round(req.weight / (height_m ** 2), 1)
    
    # Construct DataFrame to preserve feature names for StandardScaler
    features_df = pd.DataFrame([[
        req.age,
        req.gender,
        req.height,
        req.weight,
        req.ap_hi,
        req.ap_lo,
        req.cholesterol,
        req.gluc,
        req.smoke,
        req.alco,
        req.active
    ]], columns=FEATURE_NAMES)
    
    features_scaled = scaler.transform(features_df)
    prediction = int(chosen_model.predict(features_scaled)[0])
    
    # Get probability
    if hasattr(chosen_model, "predict_proba"):
        probability = float(chosen_model.predict_proba(features_scaled)[0][1])
    else:
        probability = float(prediction)
    prob_pct = int(round(probability * 100))
    
    # Determine risk level category & status message
    if prob_pct < 35:
        risk_level = "Low Risk 🟢"
        status_message = "Great news! Your heart metrics look healthy and strong!"
    elif prob_pct < 65:
        risk_level = "Moderate Risk 🟡"
        status_message = "Moderate risk detected. Slight adjustments to your daily routine can make a big difference!"
    else:
        risk_level = "High Risk 🔴"
        status_message = "High cardiovascular risk detected! We recommend scheduling a medical checkup soon."
        
    # Personalised Recommendations based on parameters
    recommendations = []
    if req.ap_hi > 130 or req.ap_lo > 85:
        recommendations.append("Monitor your blood pressure regularly and aim to reduce sodium in your diet.")
    if req.cholesterol > 1:
        recommendations.append("Increase healthy fats (avocados, nuts) and limit saturated fats to lower cholesterol.")
    if req.smoke == 1:
        recommendations.append("Consider quitting smoking — it is the single best step for long-term arterial health.")
    if req.active == 0:
        recommendations.append("Aim for 150 minutes of moderate exercise (brisk walking, cycling) per week.")
    if bmi > 25:
        recommendations.append(f"Your BMI is {bmi}. Maintaining a balanced diet can help optimize heart workload.")
    if not recommendations:
        recommendations.append("Keep maintaining your awesome lifestyle choices! Stay hydrated and get 7-9 hours of sleep.")

    return PredictionResponse(
        prediction=prediction,
        probability_pct=prob_pct,
        risk_level=risk_level,
        bmi=bmi,
        status_message=status_message,
        is_high_risk=(prediction == 1 or prob_pct >= 50),
        recommendations=recommendations,
        model_used=model_display
    )

@app.get("/api/insights", response_model=InsightsResponse)
def get_insights():
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    
    df = pd.read_csv(DATA_PATH)
    
    # Clean data sample for frontend visualization
    sample_df = df.sample(n=min(300, len(df)), random_state=42).copy()
    sample_df['At_Risk'] = sample_df['cardio'].map({1: 'High Risk', 0: 'Healthy'})
    
    data_points = []
    for _, row in sample_df.iterrows():
        data_points.append(DataPoint(
            Age=float(row['age']),
            Systolic_BP=float(row['ap_hi']),
            At_Risk=str(row['At_Risk']),
            Cardio=int(row['cardio'])
        ))
        
    return InsightsResponse(
        total_records=len(df),
        healthy_count=int((df['cardio'] == 0).sum()),
        high_risk_count=int((df['cardio'] == 1).sum()),
        avg_age=round(float(df['age'].mean()), 1),
        avg_systolic_bp=round(float(df['ap_hi'].dropna().mean()), 1),
        sample_data=data_points
    )

@app.get("/api/health-tips")
def get_health_tips():
    tips = [
        {
            "id": "diet",
            "category": "Nutrition & Diet",
            "title": "🥑 Eat the Rainbow",
            "icon": "Apple",
            "description": "A balanced diet is the best fuel to keep your heart smiling.",
            "bullets": [
                "Healthy Fats: Avocados, almonds, and olive oil help improve HDL cholesterol.",
                "Lower Sodium: Keep daily salt intake under 2,300mg to keep blood pressure steady.",
                "Fiber Focus: Oats, lentils, and fresh berries work like a natural broom for your arteries!"
            ]
        },
        {
            "id": "exercise",
            "category": "Physical Activity",
            "title": "🏃‍♀️ Keep Moving Daily",
            "icon": "Activity",
            "description": "Your heart is a powerful muscle that loves regular activity!",
            "bullets": [
                "Cardio Goals: Aim for 150 minutes of moderate exercise per week.",
                "Strength & Tone: Muscle mass improves metabolism and insulin sensitivity.",
                "Post-Meal Walks: A quick 10-minute walk after lunch lowers blood sugar spikes."
            ]
        },
        {
            "id": "mindfulness",
            "category": "Mental Wellness",
            "title": "🧘‍♀️ Stress & Sleep",
            "icon": "HeartHandshake",
            "description": "Your emotional state directly impacts your heart rate and arterial pressure.",
            "bullets": [
                "Deep Breathing: Practice 5-minute box breathing when feeling anxious.",
                "Restorative Sleep: 7-9 hours of regular sleep restores cardiovascular tissue.",
                "Unplug & Relax: Limit screen time 1 hour before bed to lower cortisol."
            ]
        },
        {
            "id": "habits",
            "category": "Healthy Lifestyle",
            "title": "🚫 Smart Choices",
            "icon": "ShieldCheck",
            "description": "Eliminating risky habits provides immediate protection to your blood vessels.",
            "bullets": [
                "Quit Smoking: Arterial pressure begins dropping within 20 minutes of quitting.",
                "Moderate Alcohol: Keep alcohol intake low to protect liver and heart function.",
                "Hydrate Well: Drink 2-3 liters of water daily to maintain smooth blood viscosity."
            ]
        }
    ]
    return tips


@app.get('/api/model-analytics', response_model=ModelAnalyticsResponse)
def get_model_analytics():
    return ModelAnalyticsResponse(
        deployed_model='Gradient Boosting',
        note='Metrics computed from actual ML pipeline. Test set 20%, random_state=42.',
        models=[
            ModelMetric(name='Gradient Boosting', accuracy=91.55, f1_score=91.49, roc_auc=97.69, rss=243.56, cv_score='65.48% (5-fold)', is_deployed=True),
            ModelMetric(name='Logistic Regression', accuracy=91.25, f1_score=91.16, roc_auc=97.84, rss=237.60, cv_score=None, is_deployed=False),
            ModelMetric(name='AdaBoost', accuracy=89.70, f1_score=89.39, roc_auc=96.74, rss=503.70, cv_score=None, is_deployed=False),
        ],
        feature_importance=[
            FeatureImportanceItem(feature='ap_hi',       label='Systolic BP',       importance=58.63),
            FeatureImportanceItem(feature='age',         label='Age',               importance=19.54),
            FeatureImportanceItem(feature='cholesterol', label='Cholesterol',       importance=9.30),
            FeatureImportanceItem(feature='active',      label='Physical Activity', importance=3.60),
            FeatureImportanceItem(feature='gluc',        label='Glucose',           importance=3.57),
            FeatureImportanceItem(feature='ap_lo',       label='Diastolic BP',      importance=2.89),
            FeatureImportanceItem(feature='smoke',       label='Smoking',           importance=1.40),
            FeatureImportanceItem(feature='weight',      label='Weight',            importance=0.65),
            FeatureImportanceItem(feature='height',      label='Height',            importance=0.39),
            FeatureImportanceItem(feature='alco',        label='Alcohol',           importance=0.02),
            FeatureImportanceItem(feature='gender',      label='Gender',            importance=0.01),
        ],
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
