from pydantic import BaseModel, Field
from typing import List, Optional

class PredictionRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in years")
    gender: int = Field(..., ge=1, le=2, description="1 for Female, 2 for Male")
    height: float = Field(..., ge=100, le=230, description="Height in cm")
    weight: float = Field(..., ge=30, le=250, description="Weight in kg")
    ap_hi: int = Field(..., ge=60, le=260, description="Systolic Blood Pressure")
    ap_lo: int = Field(..., ge=40, le=200, description="Diastolic Blood Pressure")
    cholesterol: int = Field(..., ge=1, le=3, description="1: Normal, 2: Above Normal, 3: Well Above Normal")
    gluc: int = Field(..., ge=1, le=3, description="1: Normal, 2: Above Normal, 3: Well Above Normal")
    smoke: int = Field(..., ge=0, le=1, description="0 for No, 1 for Yes")
    alco: int = Field(..., ge=0, le=1, description="0 for No, 1 for Yes")
    active: int = Field(..., ge=0, le=1, description="0 for No, 1 for Yes")
    model: Optional[str] = Field(
        default="gradient_boosting",
        description="Model to use: 'gradient_boosting', 'logistic_regression', or 'adaboost'"
    )

class PredictionResponse(BaseModel):
    prediction: int
    probability_pct: int
    risk_level: str
    bmi: float
    status_message: str
    is_high_risk: bool
    recommendations: List[str]
    model_used: str

class DataPoint(BaseModel):
    Age: float
    Systolic_BP: float
    At_Risk: str
    Cardio: int

class InsightsResponse(BaseModel):
    total_records: int
    healthy_count: int
    high_risk_count: int
    avg_age: float
    avg_systolic_bp: float
    sample_data: List[DataPoint]

class HealthTip(BaseModel):
    id: str
    category: str
    title: str
    icon: str
    description: str
    bullets: List[str]

class ModelMetric(BaseModel):
    name: str
    accuracy: float
    f1_score: float
    roc_auc: float
    rss: float
    cv_score: Optional[str] = None
    is_deployed: bool = False

class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float

class ModelAnalyticsResponse(BaseModel):
    models: List[ModelMetric]
    feature_importance: List[FeatureImportanceItem]
    deployed_model: str
    note: str
