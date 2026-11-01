import {
  FailureDistributionItem,
  MachineTypeDistribution,
  FraudHourlyData,
  FeatureImportanceData,
} from '../types';

export const MACHINE_FAILURE_DISTRIBUTION: FailureDistributionItem[] = [
  { name: 'No Failure (Normal)', count: 9652, percentage: 96.5, color: '#10b981' },
  { name: 'Heat Dissipation (HDF)', count: 115, percentage: 1.15, color: '#f59e0b' },
  { name: 'Power Failure (PWF)', count: 95, percentage: 0.95, color: '#ef4444' },
  { name: 'Overstrain (OSF)', count: 78, percentage: 0.78, color: '#8b5cf6' },
  { name: 'Tool Wear (TWF)', count: 45, percentage: 0.45, color: '#06b6d4' },
  { name: 'Random Failure (RNF)', count: 15, percentage: 0.15, color: '#ec4899' },
];

export const MACHINE_TYPE_BREAKDOWN: MachineTypeDistribution[] = [
  { type: 'Type L (Low Quality - 50%)', normal: 4765, failed: 235, rate: 4.7 },
  { type: 'Type M (Medium Quality - 30%)', normal: 2917, failed: 83, rate: 2.77 },
  { type: 'Type H (High Quality - 20%)', normal: 1970, failed: 30, rate: 1.5 },
];

export const FRAUD_HOURLY_TRENDS: FraudHourlyData[] = [
  { hour: '00:00', totalTxns: 3200, fraudTxns: 18, fraudRate: 0.56 },
  { hour: '01:00', totalTxns: 2100, fraudTxns: 29, fraudRate: 1.38 },
  { hour: '02:00', totalTxns: 1400, fraudTxns: 44, fraudRate: 3.14 },
  { hour: '03:00', totalTxns: 1100, fraudTxns: 52, fraudRate: 4.73 },
  { hour: '04:00', totalTxns: 1250, fraudTxns: 41, fraudRate: 3.28 },
  { hour: '05:00', totalTxns: 1900, fraudTxns: 21, fraudRate: 1.11 },
  { hour: '06:00', totalTxns: 3800, fraudTxns: 14, fraudRate: 0.37 },
  { hour: '07:00', totalTxns: 7200, fraudTxns: 12, fraudRate: 0.17 },
  { hour: '08:00', totalTxns: 11500, fraudTxns: 16, fraudRate: 0.14 },
  { hour: '09:00', totalTxns: 14200, fraudTxns: 22, fraudRate: 0.15 },
  { hour: '10:00', totalTxns: 16800, fraudTxns: 24, fraudRate: 0.14 },
  { hour: '11:00', totalTxns: 18400, fraudTxns: 27, fraudRate: 0.15 },
  { hour: '12:00', totalTxns: 19900, fraudTxns: 29, fraudRate: 0.15 },
  { hour: '13:00', totalTxns: 19200, fraudTxns: 25, fraudRate: 0.13 },
  { hour: '14:00', totalTxns: 18700, fraudTxns: 26, fraudRate: 0.14 },
  { hour: '15:00', totalTxns: 19100, fraudTxns: 28, fraudRate: 0.15 },
  { hour: '16:00', totalTxns: 19500, fraudTxns: 31, fraudRate: 0.16 },
  { hour: '17:00', totalTxns: 20100, fraudTxns: 33, fraudRate: 0.16 },
  { hour: '18:00', totalTxns: 19800, fraudTxns: 35, fraudRate: 0.18 },
  { hour: '19:00', totalTxns: 17600, fraudTxns: 30, fraudRate: 0.17 },
  { hour: '20:00', totalTxns: 14800, fraudTxns: 28, fraudRate: 0.19 },
  { hour: '21:00', totalTxns: 11200, fraudTxns: 25, fraudRate: 0.22 },
  { hour: '22:00', totalTxns: 7800, fraudTxns: 22, fraudRate: 0.28 },
  { hour: '23:00', totalTxns: 4900, fraudTxns: 20, fraudRate: 0.41 },
];

export const FRAUD_BY_MERCHANT_CATEGORY = [
  { category: 'Online Electronics', totalVolume: 42000, fraudCount: 185, fraudRate: 4.4, avgLoss: 890 },
  { category: 'Gaming & Digital', totalVolume: 68000, fraudCount: 220, fraudRate: 3.24, avgLoss: 310 },
  { category: 'ATM Cash Out', totalVolume: 31000, fraudCount: 95, fraudRate: 3.06, avgLoss: 740 },
  { category: 'Travel & Airlines', totalVolume: 25000, fraudCount: 68, fraudRate: 2.72, avgLoss: 1250 },
  { category: 'Luxury Retail', totalVolume: 18000, fraudCount: 42, fraudRate: 2.33, avgLoss: 1680 },
  { category: 'Dining & Food', totalVolume: 85000, fraudCount: 28, fraudRate: 0.33, avgLoss: 65 },
  { category: 'Grocery', totalVolume: 112000, fraudCount: 19, fraudRate: 0.17, avgLoss: 42 },
];

export const SENSOR_FEATURE_IMPORTANCES: FeatureImportanceData[] = [
  { feature: 'Torque [Nm]', randomForest: 0.33, xgboost: 0.38, lightgbm: 0.35 },
  { feature: 'Rotational Speed [rpm]', randomForest: 0.28, xgboost: 0.29, lightgbm: 0.31 },
  { feature: 'Tool Wear [min]', randomForest: 0.19, xgboost: 0.16, lightgbm: 0.18 },
  { feature: 'Process Temperature [K]', randomForest: 0.11, xgboost: 0.09, lightgbm: 0.08 },
  { feature: 'Air Temperature [K]', randomForest: 0.06, xgboost: 0.05, lightgbm: 0.05 },
  { feature: 'Air Gap [mm]', randomForest: 0.03, xgboost: 0.03, lightgbm: 0.03 },
];

export const FINANCIAL_FEATURE_IMPORTANCES: FeatureImportanceData[] = [
  { feature: 'Transaction Amount ($)', randomForest: 0.29, xgboost: 0.34, lightgbm: 0.32 },
  { feature: 'Velocity (24h burst count)', randomForest: 0.25, xgboost: 0.28, lightgbm: 0.27 },
  { feature: 'Distance from Home (km)', randomForest: 0.21, xgboost: 0.19, lightgbm: 0.20 },
  { feature: 'Device Trust Score', randomForest: 0.14, xgboost: 0.11, lightgbm: 0.12 },
  { feature: 'Temporal Off-Peak Flag', randomForest: 0.07, xgboost: 0.05, lightgbm: 0.06 },
  { feature: 'Cross-Border Binary', randomForest: 0.04, xgboost: 0.03, lightgbm: 0.03 },
];

export const SENSOR_CORRELATION_POINTS = [
  { speed: 1200, torque: 75, status: 'Overstrain Risk', isFail: true },
  { speed: 1250, torque: 68, status: 'Overstrain Risk', isFail: true },
  { speed: 1350, torque: 60, status: 'Normal', isFail: false },
  { speed: 1420, torque: 50, status: 'Normal', isFail: false },
  { speed: 1500, torque: 42, status: 'Normal', isFail: false },
  { speed: 1550, torque: 38, status: 'Normal', isFail: false },
  { speed: 1650, torque: 32, status: 'Normal', isFail: false },
  { speed: 1800, torque: 26, status: 'Normal', isFail: false },
  { speed: 2000, torque: 20, status: 'Normal', isFail: false },
  { speed: 2300, torque: 15, status: 'Normal', isFail: false },
  { speed: 2700, torque: 10, status: 'Power Anomaly', isFail: true },
  { speed: 2850, torque: 6, status: 'Power Failure', isFail: true },
  { speed: 1380, torque: 48, status: 'Heat Dissipation Warning', isFail: true },
  { speed: 1490, torque: 52, status: 'Normal', isFail: false },
  { speed: 1620, torque: 41, status: 'Normal', isFail: false },
  { speed: 1710, torque: 35, status: 'Normal', isFail: false },
  { speed: 1950, torque: 23, status: 'Normal', isFail: false },
  { speed: 2150, torque: 18, status: 'Normal', isFail: false },
];
