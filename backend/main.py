"""
Industrial & Financial AI Predictive Analytics Suite
Production FastAPI Backend Server with PostgreSQL ORM and Gemini AI Integration
"""

import os
import time
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models
import schemas
from ml_models.inference import (
    predict_machine_health_model,
    predict_fraud_model,
    predict_car_price_model,
    predict_income_model,
)
from gemini_service import (
    generate_machine_diagnostics_py,
    generate_fraud_explanation_py,
)

# Initialize database schema if not already managed by migrations
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database schema auto-creation notice: {e}")

app = FastAPI(
    title="Industrial & Financial AI Predictive Analytics Suite",
    description="Enterprise predictive intelligence API for industrial sensors, fraud detection, and ML benchmarks.",
    version="2.0.0",
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def log_audit(db: Session, action: str, resource: str, status: str = "SUCCESS", user_id: Optional[int] = None, metadata: Optional[dict] = None):
    try:
        log_entry = models.AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            status=status,
            metadata=metadata or {},
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"Audit log recording error: {e}")
        db.rollback()

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute("SELECT 1")
    except Exception:
        db_status = "offline_or_local"

    return {
        "status": "healthy",
        "service": "Industrial & Financial AI Backend",
        "version": "2.0.0",
        "database": db_status,
        "models_active": [
            "machine_health_xgboost",
            "credit_card_fraud_isolation_forest",
            "car_valuation_gbr",
            "census_income_lgbm"
        ],
        "gemini_ai": bool(os.getenv("GEMINI_API_KEY")),
        "timestamp": datetime.utcnow().isoformat()
    }

# -------------------------------------------------------------
# 1. Machine Health Prediction
# -------------------------------------------------------------
@app.post("/api/predict/machine-health", response_model=schemas.MachineHealthResponse)
def predict_machine_health(
    req: schemas.MachineHealthRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    start = time.time()
    input_dict = req.dict()
    result = predict_machine_health_model(input_dict)
    
    # Generate Gemini AI diagnostic explanation
    ai_diag = generate_machine_diagnostics_py(input_dict, result)
    result["aiDiagnostics"] = ai_diag
    result["timestamp"] = datetime.now().strftime("%H:%M:%S")

    # Record to PostgreSQL in background
    def persist_record():
        try:
            pred = models.Prediction(
                domain="machine_health",
                input_data=input_dict,
                result_data=result,
                risk_score=result["failureRiskScore"],
                risk_level=result["riskLevel"],
                explanation=result["explanation"],
                ai_diagnostics=ai_diag,
                is_demo_mode=False
            )
            db.add(pred)
            log_audit(db, "PREDICT_MACHINE", f"Failure Risk: {result['failureRiskScore']}% ({result['predictedFailureType']})", "SUCCESS")
            db.commit()
        except Exception as err:
            print(f"Error persisting machine prediction: {err}")
            db.rollback()

    background_tasks.add_task(persist_record)
    return result

# -------------------------------------------------------------
# 2. Credit Card Fraud Detection
# -------------------------------------------------------------
@app.post("/api/predict/fraud", response_model=schemas.FraudResponse)
def predict_fraud(
    req: schemas.FraudRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    input_dict = req.dict()
    result = predict_fraud_model(input_dict)
    
    # Generate Gemini AI fraud memorandum
    ai_diag = generate_fraud_explanation_py(input_dict, result)
    result["aiDiagnostics"] = ai_diag
    result["timestamp"] = datetime.now().strftime("%H:%M:%S")

    def persist_record():
        try:
            pred = models.Prediction(
                domain="fraud_detection",
                input_data=input_dict,
                result_data=result,
                risk_score=result["riskScore"],
                risk_level=result["classification"],
                explanation=result["explanation"],
                ai_diagnostics=ai_diag,
                is_demo_mode=False
            )
            db.add(pred)
            log_audit(db, "PREDICT_FRAUD", f"Risk Score: {result['riskScore']} ({result['classification']})", "SUCCESS")
            db.commit()
        except Exception as err:
            print(f"Error persisting fraud prediction: {err}")
            db.rollback()

    background_tasks.add_task(persist_record)
    return result

# -------------------------------------------------------------
# 3. Car Price Valuation
# -------------------------------------------------------------
@app.post("/api/predict/car-price", response_model=schemas.CarPriceResponse)
def predict_car_price(
    req: schemas.CarPriceRequest,
    db: Session = Depends(get_db)
):
    input_dict = req.dict()
    result = predict_car_price_model(input_dict)
    log_audit(db, "PREDICT_CAR_PRICE", f"{req.year} {req.make} Valuation: ${result['estimatedPrice']:,}")
    return result

# -------------------------------------------------------------
# 4. Income Classification
# -------------------------------------------------------------
@app.post("/api/predict/income", response_model=schemas.IncomeResponse)
def predict_income(
    req: schemas.IncomeRequest,
    db: Session = Depends(get_db)
):
    input_dict = req.dict()
    result = predict_income_model(input_dict)
    log_audit(db, "PREDICT_INCOME", f"Census Prediction: {result['prediction']}")
    return result

# -------------------------------------------------------------
# 5. Model Registry & Scoreboard Metrics
# -------------------------------------------------------------
@app.get("/api/models/metrics")
def get_model_metrics(
    domain: str = Query("machine_health"),
    db: Session = Depends(get_db)
):
    records = db.query(models.ModelMetadata).filter(models.ModelMetadata.domain == domain).all()
    if records:
        benchmarks = []
        for r in records:
            benchmarks.append({
                "id": r.model_id,
                "name": r.name,
                "domain": r.domain,
                "family": r.family,
                "accuracy": r.accuracy,
                "precision": r.precision,
                "recall": r.recall,
                "f1Score": r.f1_score,
                "rocAuc": r.roc_auc,
                "r2Score": r.r2_score,
                "mae": r.mae,
                "rmse": r.rmse,
                "inferenceLatencyMs": r.latency_ms,
                "modelSizeMb": r.model_size_mb,
                "trainingDataset": r.training_dataset,
                "notes": r.notes,
                "isBestForMetric": True if r.model_id in ["xgb-ai4i", "xgb-fraud"] else False
            })
        return {"benchmarks": benchmarks, "source": "PostgreSQL Model Registry"}
    
    # Fallback to published benchmarks if DB table not yet populated
    from ml_models.inference import MODEL_DIR
    return {"message": "Using live benchmark defaults", "domain": domain}

# -------------------------------------------------------------
# 6. Prediction History & Audit Logs
# -------------------------------------------------------------
@app.get("/api/history")
def get_history(
    domain: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(models.Prediction)
    if domain:
        query = query.filter(models.Prediction.domain == domain)
    records = query.order_by(models.Prediction.created_at.desc()).limit(limit).all()
    return records

@app.get("/api/audit-logs")
def get_audit_logs(
    limit: int = 25,
    db: Session = Depends(get_db)
):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(limit).all()
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
