"""
Gemini AI Service for FastAPI Backend
Integrates Gemini 3.8 Flash securely on the server side for diagnostics and explanations.
"""

import os
from typing import Dict, Any

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "MY_GEMINI_API_KEY":
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: google-genai client initialization failed: {e}")
        return None

def generate_machine_diagnostics_py(input_data: Dict[str, Any], result_data: Dict[str, Any]) -> str:
    client = get_gemini_client()
    if not client:
        return result_data.get("explanation", "Nominal operational envelope verified.")

    try:
        prompt = f"""You are a senior predictive maintenance engineer diagnosing an industrial CNC machining spindle.
Sensor readings:
- Air Temperature: {input_data.get('airTemperature')} K
- Process Temperature: {input_data.get('processTemperature')} K (ΔT: {result_data.get('metrics', {}).get('tempDifference')} K)
- Rotational Speed: {input_data.get('rotationalSpeed')} rpm
- Torque: {input_data.get('torque')} Nm
- Tool Wear: {input_data.get('toolWear')} min
- Air Gap: {input_data.get('airGap')} mm
- Machine Variant: {input_data.get('machineType')}

Model assessment:
- Risk Score: {result_data.get('failureRiskScore')}%
- Risk Level: {result_data.get('riskLevel')}
- Predicted Fault: {result_data.get('predictedFailureType')}

Provide a structured, 2-paragraph engineering diagnostic:
1. Physical root cause (heat dissipation, mechanical shear, or motor stall).
2. Actionable preventative maintenance checklist."""

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )
        return response.text.strip() if response.text else result_data.get("explanation")
    except Exception as err:
        print(f"Gemini API call error: {err}")
        return result_data.get("explanation")

def generate_fraud_explanation_py(input_data: Dict[str, Any], result_data: Dict[str, Any]) -> str:
    client = get_gemini_client()
    if not client:
        return result_data.get("explanation", "Standard fraud scoring applied.")

    try:
        prompt = f"""You are an Anti-Fraud Intelligence Director at an international merchant acquirer.
Transaction details:
- Amount: ${input_data.get('amount')}
- Hour: {input_data.get('timeHour')}:00 UTC
- Merchant Category: {input_data.get('merchantCategory')}
- Distance from Home: {input_data.get('distanceFromHomeKm')} km
- International Flag: {input_data.get('isInternational')}
- Device Trust Score: {input_data.get('deviceTrustScore')}/100
- 24h Velocity Count: {input_data.get('transactionVelocity24h')} txns

Model verdict:
- Risk Score: {result_data.get('riskScore')}/100
- Classification: {result_data.get('classification')}
- Recommended Action: {result_data.get('recommendedAction')}

Provide a 2-paragraph fraud analysis:
1. Behavioral anomaly attribution across velocity, geographic delta, and device trust.
2. Compliance mitigation protocol under AML regulations."""

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )
        return response.text.strip() if response.text else result_data.get("explanation")
    except Exception as err:
        print(f"Gemini API call error: {err}")
        return result_data.get("explanation")
