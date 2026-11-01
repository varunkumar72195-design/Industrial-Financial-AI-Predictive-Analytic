from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String, default="analyst", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    predictions = relationship("Prediction", back_populates="user")
    batch_predictions = relationship("BatchPrediction", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    domain = Column(String, nullable=False, index=True)
    input_data = Column(JSON, nullable=False)
    result_data = Column(JSON, nullable=False)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    explanation = Column(String, nullable=True)
    ai_diagnostics = Column(String, nullable=True)
    is_demo_mode = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")

class BatchPrediction(Base):
    __tablename__ = "batch_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    domain = Column(String, nullable=False, index=True)
    file_name = Column(String, nullable=True)
    total_records = Column(Integer, nullable=False)
    flagged_count = Column(Integer, nullable=False)
    avg_risk_score = Column(Float, nullable=False)
    duration_ms = Column(Integer, nullable=False)
    summary = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="batch_predictions")

class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=False, index=True)
    family = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=False)
    model_size_mb = Column(Float, nullable=False)
    training_dataset = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    is_deployed = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)
    resource = Column(String, nullable=False)
    status = Column(String, default="SUCCESS", nullable=False)
    ip_address = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")
