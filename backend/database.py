import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Build PostgreSQL connection URL from environment or fallback to local postgres
SQL_USER = os.getenv("SQL_USER", "postgres")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "postgres")
SQL_HOST = os.getenv("SQL_HOST", "localhost")
SQL_DB_NAME = os.getenv("SQL_DB_NAME", "predictive_suite")
SQL_PORT = os.getenv("SQL_PORT", "5432")

# Check if Unix socket or TCP
if SQL_HOST.startswith("/"):
    DATABASE_URL = f"postgresql+psycopg2://{SQL_USER}:{SQL_PASSWORD}@/{SQL_DB_NAME}?host={SQL_HOST}"
else:
    DATABASE_URL = f"postgresql+psycopg2://{SQL_USER}:{SQL_PASSWORD}@{SQL_HOST}:{SQL_PORT}/{SQL_DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
