/**
 * Shared TypeScript definitions for Industrial & Financial AI Predictive Analytics Suite
 */

// Module 1: Machine Health Types
export type MachineType = 'L' | 'M' | 'H'; // Low, Medium, High quality variant

export interface MachineHealthInput {
  airTemperature: number; // in Kelvin or Celsius (standard Kelvin 295-305K)
  processTemperature: number; // in Kelvin (usually airTemp + 10K)
  rotationalSpeed: number; // in RPM (e.g. 1100 - 2900)
  torque: number; // in Nm (e.g. 3.5 - 75)
  toolWear: number; // in minutes (e.g. 0 - 250)
  airGap: number; // in mm (e.g. 0.8 - 4.5 mm)
  machineType: MachineType;
}

export type FailureType =
  | 'No Failure'
  | 'Tool Wear Failure (TWF)'
  | 'Heat Dissipation Failure (HDF)'
  | 'Power Failure (PWF)'
  | 'Overstrain Failure (OSF)'
  | 'Random Failures (RNF)';

export interface SensorImportance {
  feature: string;
  importance: number; // 0 to 1
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface MachineHealthResult {
  failureRiskScore: number; // 0 - 100%
  riskLevel: 'Low' | 'Moderate' | 'Critical';
  predictedFailureType: FailureType;
  failureProbability: number; // 0.0 - 1.0
  sensorImportances: SensorImportance[];
  explanation: string;
  recommendations: string[];
  metrics: {
    tempDifference: number; // process - air
    powerWatt: number; // torque * speed * 2pi/60
    strainFactor: number;
  };
  aiDiagnostics?: string;
  isDemoMode: boolean;
  timestamp: string;
}

// Module 2: Credit Card Fraud Detection Types
export interface FraudInput {
  amount: number;
  timeHour: number; // 0 - 23
  merchantCategory: 'Grocery' | 'Luxury Retail' | 'Travel & Airlines' | 'Online Electronics' | 'Gaming & Digital' | 'ATM Cash Out' | 'Dining';
  cardholderAge: number;
  distanceFromHomeKm: number;
  isInternational: boolean;
  deviceTrustScore: number; // 0 - 100
  transactionVelocity24h: number; // number of transactions in last 24h
  // Optional PCA features for ML practitioners
  v1?: number;
  v2?: number;
  v3?: number;
  v4?: number;
}

export interface FraudAnomalyIndicator {
  name: string;
  score: number; // 0 - 100
  isTriggered: boolean;
  detail: string;
}

export interface FraudResult {
  riskScore: number; // 0 - 100
  classification: 'Legitimate' | 'Suspicious' | 'High-Risk Fraud';
  fraudProbability: number; // 0.0 - 1.0
  confidence: number;
  anomalyIndicators: FraudAnomalyIndicator[];
  explanation: string;
  recommendedAction: 'Approve' | 'Review with 2FA' | 'Decline & Block';
  aiDiagnostics?: string;
  isDemoMode: boolean;
  timestamp: string;
}

// Module 3: Visual Analytics Types
export interface FailureDistributionItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MachineTypeDistribution {
  type: string;
  normal: number;
  failed: number;
  rate: number;
}

export interface FraudHourlyData {
  hour: string;
  totalTxns: number;
  fraudTxns: number;
  fraudRate: number;
}

export interface FeatureImportanceData {
  feature: string;
  randomForest: number;
  xgboost: number;
  lightgbm: number;
}

// Module 4: AI Model Scoreboard Types
export type ModelDomain = 'machine_health' | 'fraud_detection' | 'car_price' | 'income_classification';

export interface ModelBenchmark {
  id: string;
  name: string;
  family: 'Tree-based Ensemble' | 'Gradient Boosting' | 'Linear/Logistic' | 'Kernel/SVM' | 'Neural/Deep Learning';
  domain: ModelDomain;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  prAuc?: number;
  mae?: number; // for regression (car price)
  rmse?: number;
  r2Score?: number;
  inferenceLatencyMs: number;
  modelSizeMb: number;
  isBestForMetric?: boolean;
  trainingDataset: string;
  datasetSize: string;
  notes: string;
}

// Module 5: Car Price & Income Prediction Types
export interface CarPriceInput {
  make: string;
  year: number;
  mileageKm: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual' | 'Dual-Clutch';
  engineSizeL: number;
  horsepower: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  bodyType: 'Sedan' | 'SUV' | 'Coupe' | 'Hatchback' | 'Truck';
}

export interface DepreciationPoint {
  year: number;
  estimatedValue: number;
  depreciationPct: number;
}

export interface CarPriceResult {
  estimatedPrice: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  confidence: number;
  depreciationCurve: DepreciationPoint[];
  factorBreakdown: {
    factor: string;
    impactDollars: number;
    description: string;
  }[];
  explanation: string;
  isDemoMode: boolean;
}

export interface IncomeInput {
  age: number;
  education: 'Bachelors' | 'Masters' | 'Doctorate' | 'HS-grad' | 'Some-college' | 'Assoc-acdm';
  occupation: 'Tech-Support' | 'Exec-Managerial' | 'Prof-Specialty' | 'Sales' | 'Craft-repair' | 'Administrative' | 'Other-service';
  hoursPerWeek: number;
  capitalGain: number;
  capitalLoss: number;
  maritalStatus: 'Married-civ-spouse' | 'Never-married' | 'Divorced' | 'Separated';
  workClass: 'Private' | 'Self-emp-not-inc' | 'Self-emp-inc' | 'Federal-gov' | 'Local-gov';
}

export interface IncomeResult {
  prediction: '<= $50,000 / year' | '> $50,000 / year';
  probabilityAbove50k: number; // 0.0 - 1.0
  confidenceScore: number;
  socioeconomicDrivers: {
    factor: string;
    contribution: number; // -1.0 to 1.0
    impact: 'positive' | 'negative';
  }[];
  explanation: string;
  isDemoMode: boolean;
}

// Module 6: Python Practice Quiz Types
export interface QuizOption {
  id: string;
  text: string;
  codeSnippet?: string;
}

export interface QuizQuestion {
  id: number;
  title: string;
  category: 'NumPy' | 'Pandas' | 'Scikit-Learn' | 'Core Python' | 'Machine Learning Engineering';
  difficulty: 'Beginner' | 'Intermediate';
  prompt: string;
  code?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  whyWrongNotes?: Record<string, string>;
}

// Batch Prediction Types
export interface BatchRecordItem {
  id: string;
  data: Record<string, any>;
  resultStatus: 'Low Risk' | 'Low' | 'Moderate' | 'Critical' | 'Fraud' | 'Legitimate';
  score: number;
  predictedClass: string;
  flagged: boolean;
}

export interface BatchSummary {
  totalProcessed: number;
  flaggedCount: number;
  flaggedPercentage: number;
  averageRiskScore: number;
  executionTimeMs: number;
}

// FastAPI Connection Configuration
export interface FastApiConfig {
  baseUrl: string;
  isConnected: boolean;
  lastChecked: string | null;
  mode: 'demo' | 'live';
  latencyMs?: number;
  serverInfo?: {
    app: string;
    version: string;
    endpoints: string[];
  };
}
