# Industrial & Financial AI Predictive Analytics Backend

Enterprise Python FastAPI service supporting machine failure prediction, financial credit card fraud screening, vehicle price regression, census income classification, PostgreSQL ORM persistence, and server-side Gemini AI explanations.

---

## 1. Prerequisites
- Python 3.10+
- PostgreSQL 14+ (or Google Cloud SQL PostgreSQL)
- Optional: Google Gemini API Key

---

## 2. Quickstart & Local Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Run database migrations with Alembic
alembic upgrade head

# 6. Start the FastAPI development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 3. Environment Variables (`.env`)

```ini
# PostgreSQL Connection
SQL_HOST=localhost
SQL_PORT=5432
SQL_DB_NAME=predictive_suite
SQL_USER=postgres
SQL_PASSWORD=your_password

# Gemini AI (Server-side reasoning & diagnostics)
GEMINI_API_KEY=AIzaSy...
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check, DB connection status, loaded models |
| `POST` | `/api/predict/machine-health` | Industrial sensor failure diagnosis + Gemini explanation |
| `POST` | `/api/predict/fraud` | Financial transaction fraud screening + AML audit |
| `POST` | `/api/predict/car-price` | Secondary vehicle market valuation regression |
| `POST` | `/api/predict/income` | Census household income classification |
| `GET` | `/api/models/metrics` | ML model scoreboard & empirical benchmarks |
| `GET` | `/api/history` | Historical prediction audit records from PostgreSQL |
| `GET` | `/api/audit-logs` | Security and compliance audit trail |

---

## 5. Automated Testing

Run backend tests using `pytest`:
```bash
pytest test_api.py -v
```
