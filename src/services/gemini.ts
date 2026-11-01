import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  genAI = new GoogleGenAI({ apiKey });
  return genAI;
}

/**
 * Helper to race any promise against a timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate deep engineering diagnostics for industrial machine sensors
 */
export async function generateMachineDiagnostics(
  input: Record<string, any>,
  result: Record<string, any>
): Promise<string> {
  const client = getGeminiClient();
  const fallbackDiagnostic = `[Engineering Analysis] Operational telemetry indicates ${result.predictedFailureType} profile with ${result.riskLevel} risk (${result.failureRiskScore}%). Process temperature gradient ΔT is ${result.metrics?.tempDifference}K with active spindle power dissipation at ${result.metrics?.powerWatt}W and tool wear index of ${input.toolWear} min. Root cause aligns with ${result.sensorImportances?.[0]?.feature || 'thermal/mechanical stress'}. Immediate servicing of cutting insert and coolant flow calibration recommended before next duty cycle.`;

  if (!client) {
    return fallbackDiagnostic;
  }

  const prompt = `You are an industrial mechanical reliability engineer analyzing telemetry from a CNC milling machine.
Sensor readings:
- Air Temperature: ${input.airTemperature} K
- Process Temperature: ${input.processTemperature} K (ΔT = ${result.metrics?.tempDifference} K)
- Rotational Speed: ${input.rotationalSpeed} rpm
- Torque: ${input.torque} Nm
- Tool Wear: ${input.toolWear} minutes
- Air Gap: ${input.airGap} mm
- Machine Type: ${input.machineType}

Preliminary ML model verdict:
- Risk Level: ${result.riskLevel} (${result.failureRiskScore}%)
- Predicted Failure Mode: ${result.predictedFailureType}
- Calculated Power: ${result.metrics?.powerWatt} Watts
- Strain Factor: ${result.metrics?.strainFactor}

Provide a concise, 2-3 paragraph professional diagnostic analysis:
1. Physical root-cause assessment of why this condition occurred.
2. Immediate corrective engineering actions (e.g. spindle cooling, feed rate adjustments, or tool replacement).
3. Risk mitigation timeline.`;

  try {
    return await withTimeout(
      client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      }).then((res) => res.text?.trim() || fallbackDiagnostic),
      2500,
      fallbackDiagnostic
    );
  } catch (err) {
    console.warn('Gemini diagnostic generation failed or timed out:', err);
    return fallbackDiagnostic;
  }
}

/**
 * Generate regulatory and fraud risk explanations for financial transactions
 */
export async function generateFraudExplanation(
  input: Record<string, any>,
  result: Record<string, any>
): Promise<string> {
  const client = getGeminiClient();
  const fallbackMemo = `[AML Memorandum] Multi-factor authentication triage for $${input.amount} transaction at ${input.merchantCategory}. Classified as ${result.classification} (Composite Risk Score: ${result.riskScore}/100). Primary anomalies: ${input.isInternational ? 'Cross-border transaction' : 'Geographic displacement'} of ${input.distanceFromHomeKm}km with ${input.transactionVelocity24h} transactions in trailing 24h window and device trust rating of ${input.deviceTrustScore}/100. Action protocol: ${result.recommendedAction}. Mandate Step-Up OTP and temporary merchant hold under Section 314(b) AML guidelines.`;

  if (!client) {
    return fallbackMemo;
  }

  const prompt = `You are a senior AML (Anti-Money Laundering) and fraud risk investigator at a tier-1 payment processor.
Authorization parameters:
- Transaction Amount: $${input.amount}
- Hour of Day: ${input.timeHour}:00 UTC
- Merchant Category: ${input.merchantCategory}
- Distance From Cardholder Residence: ${input.distanceFromHomeKm} km
- Cross-Border Flag: ${input.isInternational}
- Device Fingerprint Trust Score: ${input.deviceTrustScore} / 100
- 24-Hour Velocity: ${input.transactionVelocity24h} transactions

ML Model Verdict:
- Fraud Probability Score: ${result.riskScore} / 100
- Classification: ${result.classification}
- Action: ${result.recommendedAction}

Provide a structured, 2-3 paragraph risk memorandum:
1. Multi-factor anomaly pattern identification (behavioral velocity, geo-anomaly, device reputation).
2. Justification for the recommended security action (${result.recommendedAction}).
3. Cardholder verification protocol under PCI-DSS standards.`;

  try {
    return await withTimeout(
      client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      }).then((res) => res.text?.trim() || fallbackMemo),
      2500,
      fallbackMemo
    );
  } catch (err) {
    console.warn('Gemini fraud explanation failed or timed out:', err);
    return fallbackMemo;
  }
}

/**
 * Generate machine learning model comparative summary
 */
export async function generateModelSummary(
  domain: string,
  benchmarks: any[]
): Promise<string> {
  const client = getGeminiClient();
  const fallbackSummary = `The benchmark suite highlights Gradient Boosting (XGBoost) and Ensemble Trees (Random Forest) as top performers for ${domain}, delivering optimal ROC-AUC curves while maintaining sub-5ms latency requirements for real-time inference pipelines.`;

  if (!client) {
    return fallbackSummary;
  }

  const prompt = `You are a Lead ML Engineer evaluating algorithm benchmarks for domain: ${domain}.
Evaluated algorithms:
${JSON.stringify(benchmarks, null, 2)}

Provide a concise technical assessment:
1. Trade-off analysis between sensitivity/recall vs precision on imbalanced dataset.
2. Inference latency vs model memory footprint trade-offs for edge/cloud deployments.
3. Recommended model architecture for production deployment.`;

  try {
    return await withTimeout(
      client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      }).then((res) => res.text?.trim() || fallbackSummary),
      2500,
      fallbackSummary
    );
  } catch (err) {
    console.warn('Gemini model summary failed or timed out:', err);
    return fallbackSummary;
  }
}
