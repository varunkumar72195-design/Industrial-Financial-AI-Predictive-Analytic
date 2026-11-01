import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  savePrediction,
  getPredictionHistory,
  saveBatchResult,
  getBatchHistory,
  recordAuditLog,
  getAuditLogs,
  getModelMetadataFromDb,
} from './src/db/predictions.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  generateMachineDiagnostics,
  generateFraudExplanation,
  generateModelSummary,
} from './src/services/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Configurable external FastAPI target URL
let fastApiBaseUrl = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

// API: Health & Server status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Industrial & Financial AI Predictive Analytics Backend',
    timestamp: new Date().toISOString(),
    fastApiTarget: fastApiBaseUrl,
    cloudSql: Boolean(process.env.SQL_HOST),
    geminiAi: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// API: Get / Update FastAPI upstream configuration
app.get('/api/fastapi/config', (req: Request, res: Response) => {
  res.json({
    baseUrl: fastApiBaseUrl,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/fastapi/config', (req: Request, res: Response) => {
  const { baseUrl } = req.body;
  if (baseUrl && typeof baseUrl === 'string') {
    fastApiBaseUrl = baseUrl.trim().replace(/\/+$/, '');
    res.json({ success: true, baseUrl: fastApiBaseUrl, message: 'FastAPI target URL updated successfully.' });
  } else {
    res.status(400).json({ error: 'Invalid baseUrl parameter provided.' });
  }
});

// API: Ping upstream FastAPI
app.get('/api/fastapi/health', async (req: Request, res: Response) => {
  const target = (req.query.url as string) || fastApiBaseUrl;
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const upstream = await fetch(`${target}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    const latencyMs = Math.round(performance.now() - start);
    if (upstream.ok) {
      let data = {};
      try {
        data = await upstream.json();
      } catch (e) {
        // empty json
      }
      res.json({
        ok: true,
        latencyMs,
        target,
        serverInfo: data,
        message: 'External Python FastAPI backend is online and responding.',
      });
    } else {
      res.json({
        ok: false,
        latencyMs,
        target,
        status: upstream.status,
        message: `FastAPI responded with HTTP status ${upstream.status}`,
      });
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    res.json({
      ok: false,
      latencyMs,
      target,
      message: err.name === 'AbortError' ? 'Connection timed out (3500ms)' : 'Unable to connect to external FastAPI server',
    });
  }
});

// -------------------------------------------------------------
// POSTGRESQL & PREDICTION API ENDPOINTS
// -------------------------------------------------------------

// Sync user from Firebase authentication
app.post('/api/auth/sync', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing uid or email' });
    }
    const user = await getOrCreateUser(uid, email, displayName);
    await recordAuditLog({
      userId: user.id,
      userEmail: email,
      action: 'USER_SYNC',
      resource: `User ${email}`,
      metadata: { displayName },
    });
    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Failed to sync user:', err);
    res.status(500).json({ error: 'Failed to record user in database' });
  }
});

// Query prediction history from PostgreSQL
app.get('/api/history', async (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as string | undefined;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const records = await getPredictionHistory(domain, limit);
    res.json(records);
  } catch (err: any) {
    console.error('Failed to fetch prediction history:', err);
    res.status(500).json({ error: 'Failed to fetch history from database' });
  }
});

// Record and persist machine health prediction
app.post(['/api/predict/machine-health', '/api/predict/machine'], optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const input = req.body;

    // Check if live FastAPI is connected
    let result: any = null;
    let isLive = false;
    try {
      const upstream = await fetch(`${fastApiBaseUrl}/api/predict/machine-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(1000),
      });
      if (upstream.ok) {
        result = await upstream.json();
        isLive = true;
      }
    } catch (e) {
      // Continue to baseline calculation
    }

    if (!result) {
      // Calibrated baseline with robust fallbacks
      const airTemp = Number(input.airTemperature ?? input.airTemperatureK) || 300.0;
      const procTemp = Number(input.processTemperature ?? input.processTemperatureK) || 310.0;
      const speed = Number(input.rotationalSpeed ?? input.rotationalSpeedRpm) || 1500;
      const torque = Number(input.torque ?? input.torqueNm) || 40.0;
      const wear = Number(input.toolWear ?? input.toolWearMin) || 0;
      const airGap = typeof input.airGap === 'number' ? input.airGap : 2.0;
      const machineType = (input.machineType || input.type || 'M') as 'L' | 'M' | 'H';

      const tempDiff = procTemp - airTemp;
      const powerWatt = (torque * speed * 2 * Math.PI) / 60;
      const strainFactor = wear * torque;

      const hdfRisk = tempDiff < 8.6 && speed < 1380 ? 0.85 : Math.max(0, (10 - tempDiff) / 10) * 0.4;
      const pwfRisk = powerWatt < 3500 || powerWatt > 9000 ? 0.9 : 0.05;
      const twfRisk = wear > 200 ? 0.85 : (wear / 240) * 0.5;
      const osfMultiplier = machineType === 'L' ? 11000 : machineType === 'M' ? 12000 : 13000;
      const osfRisk = strainFactor > osfMultiplier ? 0.88 : (strainFactor / osfMultiplier) * 0.45;
      const airGapRisk = airGap > 3.2 || airGap < 1.0 ? 0.65 : 0.04;

      const rawRisk = Math.max(hdfRisk, pwfRisk, twfRisk, osfRisk, airGapRisk);
      const failureRiskScore = Math.min(99.4, Math.max(1.2, Math.round(rawRisk * 100 * 10) / 10));

      let riskLevel: 'Low' | 'Moderate' | 'Critical' = 'Low';
      if (failureRiskScore >= 65) riskLevel = 'Critical';
      else if (failureRiskScore >= 25) riskLevel = 'Moderate';

      let predictedFailureType = 'No Failure';
      if (failureRiskScore >= 25) {
        if (pwfRisk >= 0.8) predictedFailureType = 'Power Failure (PWF)';
        else if (twfRisk >= 0.8) predictedFailureType = 'Tool Wear Failure (TWF)';
        else if (hdfRisk >= 0.7) predictedFailureType = 'Heat Dissipation Failure (HDF)';
        else if (osfRisk >= 0.7) predictedFailureType = 'Overstrain Failure (OSF)';
        else predictedFailureType = 'Random Failures (RNF)';
      }

      result = {
        failureRiskScore,
        riskLevel,
        predictedFailureType,
        failureProbability: failureRiskScore / 100,
        sensorImportances: [
          {
            feature: 'Torque & Rotational Power',
            importance: 0.34,
            impact: powerWatt > 8500 || powerWatt < 3800 ? 'negative' : 'positive',
            description: `Calculated power draw is ${Math.round(powerWatt)} W.`,
          },
          {
            feature: 'Tool Wear Accumulation',
            importance: 0.28,
            impact: wear > 180 ? 'negative' : 'positive',
            description: `Accumulated wear is ${wear} min.`,
          },
          {
            feature: 'Temperature Gradient (ΔT)',
            importance: 0.21,
            impact: tempDiff < 8.6 ? 'negative' : 'positive',
            description: `ΔT is ${tempDiff.toFixed(1)} K.`,
          },
          {
            feature: 'Air Gap Clearance',
            importance: 0.17,
            impact: airGap > 3.0 || airGap < 1.2 ? 'negative' : 'neutral',
            description: `Tolerance gap is ${airGap.toFixed(2)} mm.`,
          },
        ],
        explanation: `Diagnostic model evaluated equipment variant ${machineType} with ${riskLevel} risk of ${predictedFailureType}.`,
        recommendations: [
          predictedFailureType !== 'No Failure'
            ? `Perform preventative servicing for ${predictedFailureType}.`
            : 'Operational tolerance nominal. Maintain standard telemetry cycle.',
        ],
        metrics: {
          tempDifference: Math.round(tempDiff * 10) / 10,
          powerWatt: Math.round(powerWatt),
          strainFactor: Math.round(strainFactor),
        },
        isDemoMode: !isLive,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Call server-side Gemini AI for deep engineering diagnostics
    let geminiDiag = '';
    try {
      geminiDiag = await generateMachineDiagnostics(input, result);
      result.aiDiagnostics = geminiDiag;
    } catch (e) {
      console.warn('Gemini diagnostics skipped:', e);
    }

    // Persist to PostgreSQL database
    try {
      await savePrediction({
        domain: 'machine_health',
        inputData: input,
        resultData: result,
        riskScore: result.failureRiskScore,
        riskLevel: result.riskLevel,
        explanation: result.explanation,
        aiDiagnostics: geminiDiag,
        isDemoMode: result.isDemoMode,
      });

      await recordAuditLog({
        action: 'PREDICT_MACHINE',
        resource: `Spindle Telemetry (${result.predictedFailureType})`,
        status: result.riskLevel === 'Critical' ? 'WARNING' : 'SUCCESS',
        metadata: { riskScore: result.failureRiskScore },
      });
    } catch (dbErr) {
      console.warn('PostgreSQL persistence notice (lazy connection):', dbErr);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Machine health prediction error:', err);
    res.status(500).json({ error: 'Internal inference error' });
  }
});

// Record and persist credit card fraud prediction
app.post('/api/predict/fraud', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const input = req.body;

    // Check upstream FastAPI
    let result: any = null;
    let isLive = false;
    try {
      const upstream = await fetch(`${fastApiBaseUrl}/api/predict/fraud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(1000),
      });
      if (upstream.ok) {
        result = await upstream.json();
        isLive = true;
      }
    } catch (e) {
      // fallback
    }

    if (!result) {
      let anomalyPoints = 0;
      const indicators = [];

      const amount = Number(input.amount) || 120.0;
      const distanceFromHomeKm = Number(input.distanceFromHomeKm) || 10;
      const transactionVelocity24h = Number(input.transactionVelocity24h) || 1;
      const timeHour = typeof input.timeHour === 'number' ? input.timeHour : 14;
      const deviceTrustScore = typeof input.deviceTrustScore === 'number' ? input.deviceTrustScore : 85;
      const isInternational = Boolean(input.isInternational);

      const amountScore = amount > 3000 ? 95 : amount > 1200 ? 70 : amount > 500 ? 35 : 10;
      indicators.push({
        name: 'Transaction Value Anomaly',
        score: amountScore,
        isTriggered: amount > 1200,
        detail: `$${amount.toFixed(2)} vs cardholder average`,
      });
      anomalyPoints += amountScore * 0.25;

      const isFar = distanceFromHomeKm > 350;
      const distScore = distanceFromHomeKm > 1000 ? 92 : distanceFromHomeKm > 400 ? 65 : 15;
      indicators.push({
        name: 'Geographic Disparity',
        score: distScore,
        isTriggered: isFar,
        detail: `${distanceFromHomeKm} km from billing address ${isInternational ? '(Cross-Border)' : ''}`,
      });
      anomalyPoints += distScore * 0.22;

      const velScore = transactionVelocity24h > 15 ? 98 : transactionVelocity24h > 8 ? 68 : 12;
      indicators.push({
        name: 'Velocity Spike (Burst Txns)',
        score: velScore,
        isTriggered: transactionVelocity24h > 8,
        detail: `${transactionVelocity24h} transactions in 24 hours`,
      });
      anomalyPoints += velScore * 0.22;

      const isNight = timeHour >= 1 && timeHour <= 4;
      const timeScore = isNight ? 75 : 15;
      indicators.push({
        name: 'Temporal Anomaly (Night Hour)',
        score: timeScore,
        isTriggered: isNight,
        detail: `Timestamp at ${timeHour.toString().padStart(2, '0')}:00 UTC`,
      });
      anomalyPoints += timeScore * 0.12;

      const devScore = Math.max(0, 100 - deviceTrustScore);
      indicators.push({
        name: 'Device Trust Degradation',
        score: devScore,
        isTriggered: deviceTrustScore < 45,
        detail: `Device fingerprint trust score: ${deviceTrustScore}/100`,
      });
      anomalyPoints += devScore * 0.19;

      const finalRisk = Math.min(99.6, Math.max(0.8, Math.round(anomalyPoints * 10) / 10));
      const classification = finalRisk >= 70 ? 'High-Risk Fraud' : finalRisk >= 30 ? 'Suspicious' : 'Legitimate';
      const recommendedAction = finalRisk >= 70 ? 'Decline & Block' : finalRisk >= 30 ? 'Review with 2FA' : 'Approve';

      result = {
        riskScore: finalRisk,
        classification,
        fraudProbability: finalRisk / 100,
        confidence: classification === 'Suspicious' ? 0.78 : 0.94,
        anomalyIndicators: indicators,
        explanation: `Transaction scored ${finalRisk}/100 resulting in ${classification} classification.`,
        recommendedAction,
        isDemoMode: !isLive,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Call server-side Gemini AI for AML fraud risk explanations
    let geminiDiag = '';
    try {
      geminiDiag = await generateFraudExplanation(input, result);
      result.aiDiagnostics = geminiDiag;
    } catch (e) {
      console.warn('Gemini fraud explanation skipped:', e);
    }

    // Persist to PostgreSQL database
    try {
      await savePrediction({
        domain: 'fraud_detection',
        inputData: input,
        resultData: result,
        riskScore: result.riskScore,
        riskLevel: result.classification,
        explanation: result.explanation,
        aiDiagnostics: geminiDiag,
        isDemoMode: result.isDemoMode,
      });

      await recordAuditLog({
        action: 'PREDICT_FRAUD',
        resource: `Card Txn $${input.amount} (${result.classification})`,
        status: result.classification === 'High-Risk Fraud' ? 'WARNING' : 'SUCCESS',
        metadata: { riskScore: result.riskScore, action: result.recommendedAction },
      });
    } catch (dbErr) {
      console.warn('PostgreSQL persistence notice (lazy connection):', dbErr);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Fraud prediction error:', err);
    res.status(500).json({ error: 'Internal fraud screening error' });
  }
});

// Record and persist car price estimation
app.post('/api/predict/car-price', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const input = req.body;
    let result: any = null;
    let isLive = false;

    // Upstream FastAPI check
    try {
      const upstream = await fetch(`${fastApiBaseUrl}/api/predict/car-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(1000),
      });
      if (upstream.ok) {
        result = await upstream.json();
        isLive = true;
      }
    } catch (e) {
      // fallback
    }

    if (!result) {
      const currentYear = 2026;
      const year = Number(input.year) || 2022;
      const age = Math.max(0, currentYear - year);
      const make = String(input.make || 'Toyota');
      const mileage = Number(input.mileageKm) || 40000;
      const hp = Number(input.horsepower) || 180;
      const condition = String(input.condition || 'Good');
      const fuel = String(input.fuelType || 'Petrol');

      const brandBaseMap: Record<string, number> = {
        BMW: 52000, Mercedes: 56000, Audi: 50000, Tesla: 48000,
        Toyota: 32000, Honda: 30000, Ford: 34000, Hyundai: 27000,
      };
      const basePrice = brandBaseMap[make] || 33000;
      const ageDecay = Math.pow(0.87, age);
      let estimated = basePrice * ageDecay;

      const expectedMileage = age * 15000;
      const mileageDiff = mileage - expectedMileage;
      const mileageImpact = -(mileageDiff * 0.065);
      estimated += mileageImpact;

      const hpBoost = (hp - 180) * 45;
      estimated += hpBoost;

      let conditionFactor = 1.0;
      if (condition === 'Excellent') conditionFactor = 1.1;
      else if (condition === 'Fair') conditionFactor = 0.85;
      estimated *= conditionFactor;

      if (fuel === 'Electric' || fuel === 'Hybrid') estimated += 1800;
      estimated = Math.max(3500, Math.round(estimated / 100) * 100);

      const priceRangeLow = Math.round((estimated * 0.94) / 100) * 100;
      const priceRangeHigh = Math.round((estimated * 1.07) / 100) * 100;

      const depreciationCurve = [];
      for (let i = 0; i <= 5; i++) {
        const projectedVal = Math.round((estimated * Math.pow(0.88, i)) / 100) * 100;
        depreciationCurve.push({
          year: currentYear + i,
          estimatedValue: Math.max(2500, projectedVal),
          depreciationPct: Math.round((1 - projectedVal / estimated) * 100),
        });
      }

      result = {
        estimatedPrice: estimated,
        predictedPrice: estimated,
        priceRangeLow,
        priceRangeHigh,
        confidence: 0.91,
        depreciationCurve,
        factorBreakdown: [
          { factor: `Vehicle Age (${age} yrs)`, impactDollars: Math.round(basePrice * (ageDecay - 1)), description: `Base MSRP $${basePrice}` },
          { factor: `Mileage (${mileage} km)`, impactDollars: Math.round(mileageImpact), description: `Benchmark ${expectedMileage} km` },
          { factor: `Engine Output (${hp} hp)`, impactDollars: Math.round(hpBoost), description: `Engine tuning bonus` },
          { factor: `Condition Grade (${condition})`, impactDollars: Math.round(estimated * (conditionFactor - 1)), description: `Cosmetic & mechanical check` },
        ],
        explanation: `Predicted market value of $${estimated.toLocaleString()} for ${year} ${make} based on depreciation regression.`,
        isDemoMode: !isLive,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    try {
      await savePrediction({
        domain: 'car_price',
        inputData: input,
        resultData: result,
        riskScore: result.estimatedPrice,
        riskLevel: 'Nominal',
        explanation: result.explanation,
        isDemoMode: result.isDemoMode,
      });
      await recordAuditLog({
        action: 'PREDICT_CAR_PRICE',
        resource: `${input.year || 2022} ${input.make || 'Vehicle'} ($${result.estimatedPrice})`,
        status: 'SUCCESS',
        metadata: { estimatedPrice: result.estimatedPrice },
      });
    } catch (e) {
      console.warn('DB notice for car price:', e);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Car price prediction error:', err);
    res.status(500).json({ error: 'Failed to estimate vehicle valuation' });
  }
});

// Record and persist income classification
app.post('/api/predict/income', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const input = req.body;
    let result: any = null;
    let isLive = false;

    // Upstream FastAPI check
    try {
      const upstream = await fetch(`${fastApiBaseUrl}/api/predict/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(1000),
      });
      if (upstream.ok) {
        result = await upstream.json();
        isLive = true;
      }
    } catch (e) {
      // fallback
    }

    if (!result) {
      const education = String(input.education || 'Bachelors');
      const occupation = String(input.occupation || 'Tech-Support');
      const age = Number(input.age) || 35;
      const hours = Number(input.hoursPerWeek) || 40;
      const capitalGain = Number(input.capitalGain) || 0;
      const marital = String(input.maritalStatus || 'Never-married');

      let logOdds = -2.2;
      const eduWeights: Record<string, number> = {
        Doctorate: 2.1, Masters: 1.6, Bachelors: 1.1, 'Assoc-acdm': 0.4, 'Some-college': 0.1, 'HS-grad': -0.4,
      };
      logOdds += eduWeights[education] || 0;

      const occWeights: Record<string, number> = {
        'Exec-Managerial': 1.4, 'Prof-Specialty': 1.25, 'Tech-Support': 0.8,
        Sales: 0.4, 'Craft-repair': 0.1, Administrative: -0.2, 'Other-service': -1.1,
      };
      logOdds += occWeights[occupation] || 0;

      if (age >= 38 && age <= 58) logOdds += 0.85;
      else if (age < 26) logOdds -= 1.2;

      if (hours >= 50) logOdds += 0.7;
      else if (hours < 35) logOdds -= 0.8;

      if (capitalGain > 5000) logOdds += 1.8;
      else if (capitalGain > 0) logOdds += 0.6;

      if (marital === 'Married-civ-spouse') logOdds += 1.2;

      const probability = 1 / (1 + Math.exp(-logOdds));
      const isAbove50k = probability >= 0.5;

      result = {
        prediction: isAbove50k ? '> $50,000 / year' : '<= $50,000 / year',
        predictedBracket: isAbove50k ? '> $50,000 / year' : '<= $50,000 / year',
        probabilityAbove50k: Math.round(probability * 1000) / 1000,
        confidenceScore: Math.round(Math.abs(probability - 0.5) * 2 * 100),
        socioeconomicDrivers: [
          { factor: `Education: ${education}`, contribution: Number(((eduWeights[education] || 0) / 2).toFixed(2)), impact: (eduWeights[education] || 0) >= 0 ? 'positive' : 'negative' },
          { factor: `Occupation: ${occupation}`, contribution: Number(((occWeights[occupation] || 0) / 2).toFixed(2)), impact: (occWeights[occupation] || 0) >= 0 ? 'positive' : 'negative' },
          { factor: `Hours: ${hours}h/wk`, contribution: hours >= 40 ? 0.35 : -0.4, impact: hours >= 40 ? 'positive' : 'negative' },
          { factor: `Marital: ${marital}`, contribution: marital === 'Married-civ-spouse' ? 0.5 : -0.2, impact: marital === 'Married-civ-spouse' ? 'positive' : 'negative' },
        ],
        explanation: `Census demographic model estimates ${isAbove50k ? 'higher' : 'standard'} income threshold with ${Math.round(probability * 100)}% probability.`,
        isDemoMode: !isLive,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    try {
      await savePrediction({
        domain: 'income_classification',
        inputData: input,
        resultData: result,
        riskScore: Math.round(result.probabilityAbove50k * 100),
        riskLevel: result.prediction.includes('>') ? 'Tier-Upper' : 'Tier-Standard',
        explanation: result.explanation,
        isDemoMode: result.isDemoMode,
      });
      await recordAuditLog({
        action: 'PREDICT_INCOME',
        resource: `Census Applicant (${result.prediction})`,
        status: 'SUCCESS',
        metadata: { probability: result.probabilityAbove50k },
      });
    } catch (e) {
      console.warn('DB notice for income:', e);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Income prediction error:', err);
    res.status(500).json({ error: 'Failed to classify socioeconomic income' });
  }
});

// Full-service Batch CSV Prediction & Parsing Endpoint with validation
app.post('/api/batch-predict', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawType = String(req.body.type || req.body.domain || '').toLowerCase().trim();
    const type = rawType.includes('machine') ? 'machine' : rawType.includes('fraud') ? 'fraud' : rawType;
    const csvText = req.body.csvText || req.body.csvData;
    const passedRecords = req.body.records;
    const fileName = req.body.fileName || req.body.filename || 'batch.csv';

    // Validate type parameter
    if (!type || (type !== 'machine' && type !== 'fraud')) {
      await recordAuditLog({
        action: 'BATCH_INGEST_ERROR',
        resource: 'Invalid Batch Request',
        status: 'FAILURE',
        metadata: { reason: 'Missing or unsupported batch domain type', received: req.body.type || req.body.domain },
      });
      return res.status(400).json({
        error: "Validation failed: 'type' parameter must be either 'machine' or 'fraud'.",
      });
    }

    let records: any[] = [];

    // Parse CSV if provided as raw string
    if (csvText && typeof csvText === 'string') {
      const trimmed = csvText.trim();
      if (!trimmed) {
        await recordAuditLog({
          action: 'BATCH_INGEST_ERROR',
          resource: 'Empty CSV Upload',
          status: 'FAILURE',
          metadata: { reason: 'CSV payload is completely empty' },
        });
        return res.status(400).json({ error: 'Validation failed: CSV file is empty.' });
      }

      const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        await recordAuditLog({
          action: 'BATCH_INGEST_ERROR',
          resource: 'Malformed CSV Upload',
          status: 'FAILURE',
          metadata: { reason: 'CSV has no data rows' },
        });
        return res.status(400).json({
          error: 'Validation failed: CSV file contains headers but no data records.',
        });
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      // Validate required columns
      if (type === 'machine') {
        const hasTemp = headers.some((h) => h.includes('temp') || h.includes('temperature'));
        const hasSpeed = headers.some((h) => h.includes('speed') || h.includes('rotational'));
        if (!hasTemp || !hasSpeed) {
          await recordAuditLog({
            action: 'BATCH_INGEST_ERROR',
            resource: 'Invalid CSV Headers',
            status: 'FAILURE',
            metadata: { headers, required: ['temperature', 'speed'] },
          });
          return res.status(400).json({
            error: 'Validation failed: Machine telemetry CSV must contain temperature and speed columns.',
          });
        }
      } else if (type === 'fraud') {
        const hasAmount = headers.some((h) => h.includes('amount') || h.includes('value'));
        if (!hasAmount) {
          await recordAuditLog({
            action: 'BATCH_INGEST_ERROR',
            resource: 'Invalid CSV Headers',
            status: 'FAILURE',
            metadata: { headers, required: ['amount'] },
          });
          return res.status(400).json({
            error: 'Validation failed: Fraud detection CSV must contain an amount column.',
          });
        }
      }

      const rawHeaders = lines[0].split(',').map((h) => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const row: any = {};
        rawHeaders.forEach((h, idx) => {
          row[h] = cols[idx] !== undefined ? cols[idx] : '';
        });
        records.push(row);
      }
    } else if (Array.isArray(passedRecords)) {
      records = passedRecords;
    } else {
      return res.status(400).json({
        error: "Validation failed: Must provide either 'csvText' string or 'records' array.",
      });
    }

    if (records.length === 0) {
      return res.status(400).json({ error: 'Validation failed: Zero valid records found to process.' });
    }

    // Process batch items
    const start = performance.now();
    const processedItems: any[] = [];
    let flaggedCount = 0;
    let totalScore = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const id = row.id || `REC-${(i + 1).toString().padStart(4, '0')}`;

      if (type === 'machine') {
        const airTemp = parseFloat(row.airTemperature || row.Air_temp || '298.2');
        const processTemp = parseFloat(row.processTemperature || row.Process_temp || '308.6');
        const speed = parseFloat(row.rotationalSpeed || row.Rotational_speed || '1500');
        const torque = parseFloat(row.torque || row.Torque || '40');
        const toolWear = parseFloat(row.toolWear || row.Tool_wear || '0');
        const airGap = parseFloat(row.airGap || row.Air_gap || '2.0');
        const machineType = (row.machineType || row.Type || 'M').toUpperCase();

        const tempDiff = processTemp - airTemp;
        const powerWatt = (torque * speed * 2 * Math.PI) / 60;
        const strainFactor = toolWear * torque;

        const hdfRisk = tempDiff < 8.6 && speed < 1380 ? 0.85 : 0.05;
        const pwfRisk = powerWatt < 3500 || powerWatt > 9000 ? 0.9 : 0.05;
        const twfRisk = toolWear > 200 ? 0.85 : (toolWear / 240) * 0.5;
        const osfLimit = machineType === 'L' ? 11000 : machineType === 'M' ? 12000 : 13000;
        const osfRisk = strainFactor > osfLimit ? 0.88 : (strainFactor / osfLimit) * 0.45;
        const airGapRisk = airGap > 3.2 || airGap < 1.0 ? 0.65 : 0.04;

        const rawRisk = Math.max(hdfRisk, pwfRisk, twfRisk, osfRisk, airGapRisk);
        const score = Math.min(99.4, Math.max(1.2, Math.round(rawRisk * 100 * 10) / 10));
        const status = score >= 65 ? 'Critical' : score >= 25 ? 'Moderate' : 'Low';
        const isFlagged = score >= 25;

        let failureType = 'No Failure';
        if (isFlagged) {
          if (pwfRisk >= 0.8) failureType = 'Power Failure (PWF)';
          else if (twfRisk >= 0.8) failureType = 'Tool Wear Failure (TWF)';
          else if (hdfRisk >= 0.7) failureType = 'Heat Dissipation Failure (HDF)';
          else if (osfRisk >= 0.7) failureType = 'Overstrain Failure (OSF)';
          else failureType = 'Random Failures (RNF)';
        }

        if (isFlagged) flaggedCount++;
        totalScore += score;

        processedItems.push({
          id,
          data: row,
          resultStatus: status,
          score,
          predictedClass: failureType,
          flagged: isFlagged,
        });
      } else {
        // Fraud
        const amount = parseFloat(row.amount || row.Amount || '50');
        const dist = parseFloat(row.distanceFromHomeKm || row.Distance || '10');
        const velocity = parseInt(row.transactionVelocity24h || '2', 10);
        const isIntl = String(row.isInternational).toLowerCase() === 'true';

        let risk = 8.0;
        if (amount > 1200) risk += 35;
        if (dist > 400 || isIntl) risk += 25;
        if (velocity > 8) risk += 25;

        const score = Math.min(99.6, Math.max(1.0, Math.round(risk * 10) / 10));
        const classification = score >= 70 ? 'High-Risk Fraud' : score >= 30 ? 'Suspicious' : 'Legitimate';
        const isFlagged = score >= 30;

        if (isFlagged) flaggedCount++;
        totalScore += score;

        processedItems.push({
          id,
          data: row,
          resultStatus: classification === 'High-Risk Fraud' ? 'Fraud' : classification === 'Suspicious' ? 'Moderate' : 'Legitimate',
          score,
          predictedClass: classification,
          flagged: isFlagged,
        });
      }
    }

    const duration = Math.round(performance.now() - start);
    const summary = {
      totalProcessed: records.length,
      flaggedCount,
      flaggedPercentage: records.length > 0 ? Math.round((flaggedCount / records.length) * 1000) / 10 : 0,
      averageRiskScore: records.length > 0 ? Math.round((totalScore / records.length) * 10) / 10 : 0,
      executionTimeMs: duration,
    };

    // Save to PostgreSQL batch history
    try {
      await saveBatchResult({
        domain: type === 'machine' ? 'machine_health' : 'fraud_detection',
        fileName: fileName || `${type}_batch_${Date.now()}.csv`,
        totalRecords: summary.totalProcessed,
        flaggedCount: summary.flaggedCount,
        avgRiskScore: summary.averageRiskScore,
        durationMs: summary.executionTimeMs,
        summary,
      });

      await recordAuditLog({
        action: 'BATCH_INGEST_SUCCESS',
        resource: `${type.toUpperCase()} Batch (${summary.totalProcessed} records)`,
        status: summary.flaggedCount > 0 ? 'WARNING' : 'SUCCESS',
        metadata: { flaggedCount: summary.flaggedCount, total: summary.totalProcessed },
      });
    } catch (dbErr) {
      console.warn('Batch PostgreSQL logging notice:', dbErr);
    }

    res.json({
      success: true,
      summary,
      items: processedItems,
    });
  } catch (err: any) {
    console.error('Batch predict error:', err);
    res.status(500).json({ error: 'Internal batch processing error' });
  }
});

// Batch prediction persistence
app.post('/api/predict/batch', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { domain, items, summary, fileName } = req.body;
    try {
      await saveBatchResult({
        domain: domain || 'machine_health',
        fileName: fileName || 'batch_upload.csv',
        totalRecords: summary.totalProcessed,
        flaggedCount: summary.flaggedCount,
        avgRiskScore: summary.averageRiskScore,
        durationMs: summary.executionTimeMs,
        summary,
      });

      await recordAuditLog({
        action: 'BATCH_INGEST',
        resource: `${domain} Batch (${summary.totalProcessed} records)`,
        metadata: { flaggedCount: summary.flaggedCount, fileName },
      });
    } catch (dbErr) {
      console.warn('Batch DB logging notice:', dbErr);
    }

    res.json({ success: true, summary });
  } catch (err: any) {
    console.error('Batch save error:', err);
    res.status(500).json({ error: 'Failed to record batch results' });
  }
});

// Audit logs query endpoint
app.get('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const logs = await getAuditLogs(limit);
    res.json(logs);
  } catch (err: any) {
    console.error('Failed to query audit logs:', err);
    res.status(500).json({ error: 'Failed to retrieve audit log from database' });
  }
});

// Query model metadata from Cloud SQL
app.get('/api/models/metrics', async (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as string | undefined;
    const records = await getModelMetadataFromDb(domain);
    if (records && records.length > 0) {
      return res.json({ benchmarks: records, source: 'PostgreSQL Cloud SQL Registry' });
    }
    res.json({ benchmarks: [], source: 'Database Empty' });
  } catch (err: any) {
    console.warn('Failed to read models from database, falling back:', err);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Gemini AI explanatory endpoint
app.post('/api/gemini/model-summary', async (req: Request, res: Response) => {
  try {
    const { domain, benchmarks } = req.body;
    const summary = await generateModelSummary(domain, benchmarks);
    res.json({ summary });
  } catch (err: any) {
    console.error('Gemini model summary error:', err);
    res.status(500).json({ error: 'Failed to generate model summary' });
  }
});

// Start server with Vite middleware in development or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Analytics Suite Server running on port ${PORT} (dev: ${isDev})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
