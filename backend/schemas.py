from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# 1. Machine Health Schemas
class MachineHealthRequest(BaseModel):
    airTemperature: float = Field(..., ge=280.0, le=330.0, description="Air temperature in Kelvin")
    processTemperature: float = Field(..., ge=290.0, le=340.0, description="Process temperature in Kelvin")
    rotationalSpeed: int = Field(..., ge=800, le=3500, description="Rotational speed in RPM")
    torque: float = Field(..., ge=1.0, le=100.0, description="Torque in Nm")
    toolWear: int = Field(..., ge=0, le=300, description="Tool wear in minutes")
    airGap: float = Field(..., ge=0.5, le=5.0, description="Air gap in mm")
    machineType: str = Field("M", pattern="^(L|M|H|l|m|h)$", description="Quality variant tier: L, M, or H")

class SensorImportance(BaseModel):
    feature: str
    importance: float
    impact: str
    description: str

class MachineHealthResponse(BaseModel):
    failureRiskScore: float
    riskLevel: str
    predictedFailureType: str
    failureProbability: float
    sensorImportances: List[SensorImportance]
    explanation: str
    recommendations: List[str]
    metrics: Dict[str, Any]
    aiDiagnostics: Optional[str] = None
    isDemoMode: bool = False
    timestamp: str

# 2. Fraud Detection Schemas
class FraudRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    timeHour: int = Field(..., ge=0, le=23, description="Hour of authorization (0-23)")
    merchantCategory: str = Field(..., description="Merchant category string")
    cardholderAge: int = Field(35, ge=18, le=100)
    distanceFromHomeKm: float = Field(..., ge=0)
    isInternational: bool = False
    deviceTrustScore: int = Field(..., ge=0, le=100)
    transactionVelocity24h: int = Field(..., ge=1, le=50)

class AnomalyIndicator(BaseModel):
    name: str
    score: int
    isTriggered: bool
    detail: str

class FraudResponse(BaseModel):
    riskScore: float
    classification: str
    fraudProbability: float
    confidence: float
    anomalyIndicators: List[AnomalyIndicator]
    explanation: str
    recommendedAction: str
    aiDiagnostics: Optional[str] = None
    isDemoMode: bool = False
    timestamp: str

# 3. Car Price Schemas
class CarPriceRequest(BaseModel):
    make: str
    year: int = Field(..., ge=2000, le=2026)
    mileageKm: int = Field(..., ge=0)
    fuelType: str
    transmission: str
    engineSizeL: float = Field(..., ge=0.0, le=8.0)
    horsepower: int = Field(..., ge=50, le=1000)
    condition: str
    bodyType: str

class DepreciationPoint(BaseModel):
    year: int
    estimatedValue: int
    depreciationPct: int

class FactorBreakdown(BaseModel):
    factor: str
    impactDollars: int
    description: str

class CarPriceResponse(BaseModel):
    estimatedPrice: int
    priceRangeLow: int
    priceRangeHigh: int
    confidence: float
    depreciationCurve: List[DepreciationPoint]
    factorBreakdown: List[FactorBreakdown]
    explanation: str
    isDemoMode: bool = False

# 4. Income Classification Schemas
class IncomeRequest(BaseModel):
    age: int = Field(..., ge=18, le=90)
    education: str
    occupation: str
    hoursPerWeek: int = Field(..., ge=1, le=100)
    capitalGain: int = Field(0, ge=0)
    capitalLoss: int = Field(0, ge=0)
    maritalStatus: str
    workClass: str

class SocioeconomicDriver(BaseModel):
    factor: str
    contribution: float
    impact: str

class IncomeResponse(BaseModel):
    prediction: str
    probabilityAbove50k: float
    confidenceScore: int
    socioeconomicDrivers: List[SocioeconomicDriver]
    explanation: str
    isDemoMode: bool = False

# 5. User & DB Record Schemas
class UserCreate(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    role: Optional[str] = "analyst"

class UserResponse(BaseModel):
    id: int
    uid: str
    email: str
    display_name: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionRecordResponse(BaseModel):
    id: int
    domain: str
    input_data: Dict[str, Any]
    result_data: Dict[str, Any]
    risk_score: Optional[float]
    risk_level: Optional[str]
    explanation: Optional[str]
    ai_diagnostics: Optional[str]
    is_demo_mode: bool
    created_at: datetime

    class Config:
        from_attributes = True
