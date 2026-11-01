import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Download,
  RotateCcw,
  CreditCard,
  MapPin,
  Clock,
  Smartphone,
  Zap,
  DollarSign,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';
import {
  FraudInput,
  FraudResult,
  FastApiConfig,
  BatchRecordItem,
  BatchSummary,
} from '../../types';
import {
  predictFraud,
  predictBatch,
  generateSampleFraudCsv,
} from '../../services/api';
import { EngineBadge, RiskBadge } from '../common/StatusBadge';

interface FraudDetectionModuleProps {
  config: FastApiConfig;
}

const DEFAULT_FRAUD_INPUT: FraudInput = {
  amount: 45.5,
  timeHour: 14,
  merchantCategory: 'Grocery',
  cardholderAge: 36,
  distanceFromHomeKm: 6.2,
  isInternational: false,
  deviceTrustScore: 92,
  transactionVelocity24h: 2,
};

const FRAUD_PRESETS = [
  {
    name: 'Normal Daily Grocery',
    description: '$45.50 in-town supermarket, trusted device',
    data: {
      amount: 45.5,
      timeHour: 14,
      merchantCategory: 'Grocery' as const,
      cardholderAge: 36,
      distanceFromHomeKm: 6.2,
      isInternational: false,
      deviceTrustScore: 92,
      transactionVelocity24h: 2,
    },
  },
  {
    name: 'High-Risk Offshore Electronics',
    description: '$4,250 spike at 03:00 UTC cross-border',
    data: {
      amount: 4250.0,
      timeHour: 3,
      merchantCategory: 'Online Electronics' as const,
      cardholderAge: 42,
      distanceFromHomeKm: 1420.0,
      isInternational: true,
      deviceTrustScore: 18,
      transactionVelocity24h: 14,
    },
  },
  {
    name: 'Suspicious Midnight ATM Outlier',
    description: '$1,500 cash withdrawal at 02:00 UTC',
    data: {
      amount: 1500.0,
      timeHour: 2,
      merchantCategory: 'ATM Cash Out' as const,
      cardholderAge: 29,
      distanceFromHomeKm: 320.0,
      isInternational: false,
      deviceTrustScore: 35,
      transactionVelocity24h: 7,
    },
  },
  {
    name: 'Rapid Luxury Retail Surge',
    description: '$1,890 luxury fashion burst velocity',
    data: {
      amount: 1890.0,
      timeHour: 17,
      merchantCategory: 'Luxury Retail' as const,
      cardholderAge: 51,
      distanceFromHomeKm: 85.0,
      isInternational: false,
      deviceTrustScore: 68,
      transactionVelocity24h: 9,
    },
  },
];

export const FraudDetectionModule: React.FC<FraudDetectionModuleProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [form, setForm] = useState<FraudInput>(DEFAULT_FRAUD_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);

  // Batch states
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchRecordItem[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePredict = async (inputData: FraudInput = form) => {
    setIsLoading(true);
    try {
      const res = await predictFraud(inputData, config);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (presetData: FraudInput) => {
    setForm(presetData);
    handlePredict(presetData);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = generateSampleFraudCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CreditCard_Fraud_Sample_Batch.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBatchFile(file);
      setBatchError(null);
      parseAndPredictCsv(file);
    }
  };

  const parseAndPredictCsv = (file: File) => {
    setBatchLoading(true);
    setBatchError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setBatchError('CSV file appears empty or missing transaction rows.');
          setBatchLoading(false);
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const records = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = cols[idx];
          });
          records.push(obj);
        }

        const batchRes = await predictBatch('fraud', records, config);
        setBatchResults(batchRes.items);
        setBatchSummary(batchRes.summary);
      } catch (err) {
        console.error('Fraud Batch CSV error:', err);
      } finally {
        setBatchLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredBatchItems = batchResults.filter((item) => {
    if (batchFilter === 'fraud') return item.predictedClass === 'High-Risk Fraud';
    if (batchFilter === 'suspicious') return item.predictedClass === 'Suspicious';
    if (batchFilter === 'legitimate') return item.predictedClass === 'Legitimate';
    if (searchTerm) {
      return (
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.predictedClass.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e172a] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MODULE 02
            </span>
            <EngineBadge isDemoMode={result ? result.isDemoMode : config.mode === 'demo'} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Financial Credit Card Fraud Anomaly Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Evaluate incoming authorization requests in real-time. Analyze behavioral spending deviations, geographic distance outliers, burst velocity, and device reputation signatures.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'single'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Transaction Screening
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'batch'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Batch CSV Ledger
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Presets (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Presets Bar */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transaction Profile Scenarios (Click to Load)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FRAUD_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p.data)}
                    className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePredict();
              }}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Authorization Feature Vectors
                </h3>
                <button
                  type="button"
                  onClick={() => setForm(DEFAULT_FRAUD_INPUT)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Transaction Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Transaction Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="25000"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Merchant Category */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    Merchant Category
                  </label>
                  <select
                    value={form.merchantCategory}
                    onChange={(e) =>
                      setForm({ ...form, merchantCategory: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Grocery">Grocery (Low Risk)</option>
                    <option value="Dining">Dining & Food (Low Risk)</option>
                    <option value="Online Electronics">Online Electronics (High Exposure)</option>
                    <option value="Gaming & Digital">Gaming & Digital Vouchers</option>
                    <option value="Luxury Retail">Luxury Retail Goods</option>
                    <option value="Travel & Airlines">Travel & Airlines</option>
                    <option value="ATM Cash Out">ATM Cash Out (High Anomaly)</option>
                  </select>
                </div>

                {/* Transaction Time (Hour) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Time of Authorization (Hour)
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.timeHour.toString().padStart(2, '0')}:00 UTC
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={form.timeHour}
                    onChange={(e) => setForm({ ...form, timeHour: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>00:00 (Midnight)</span>
                    <span>12:00 (Noon)</span>
                    <span>23:00 (Night)</span>
                  </div>
                </div>

                {/* Distance From Home */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Distance From Home (km)
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.distanceFromHomeKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2500"
                    step="5"
                    value={form.distanceFromHomeKm}
                    onChange={(e) =>
                      setForm({ ...form, distanceFromHomeKm: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 km (Local)</span>
                    <span>2,500 km (Foreign)</span>
                  </div>
                </div>

                {/* 24h Transaction Velocity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      24h Velocity (Txn Count)
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.transactionVelocity24h} txns
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={form.transactionVelocity24h}
                    onChange={(e) =>
                      setForm({ ...form, transactionVelocity24h: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 txn</span>
                    <span>25 txns (Spam burst)</span>
                  </div>
                </div>

                {/* Device Trust Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      Device Fingerprint Trust
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.deviceTrustScore} / 100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={form.deviceTrustScore}
                    onChange={(e) =>
                      setForm({ ...form, deviceTrustScore: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 (Unrecognized IP/OS)</span>
                    <span>100 (Known Hardware)</span>
                  </div>
                </div>
              </div>

              {/* International Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Cross-Border International Authorization
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Transaction originated outside issuer billing country
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isInternational: !form.isInternational })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    form.isInternational ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <ShieldAlert className="w-5 h-5 animate-spin" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
                {isLoading ? 'Screening Transaction...' : 'Execute Fraud Risk Scoring'}
              </button>
            </form>
          </div>

          {/* Right Column: Prediction Score & Diagnostics (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Result Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Fraud Screening Verdict
                    </span>
                    <RiskBadge level={result.classification as any} />
                  </div>

                  {/* Main Risk Score Card */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Anomaly Risk Score
                      </div>
                      <div className="text-3xl font-extrabold font-mono text-white mt-1">
                        {result.riskScore}
                        <span className="text-lg text-slate-500 font-normal"> / 100</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Policy Decision:{' '}
                        <span className="font-bold text-cyan-300">
                          {result.recommendedAction}
                        </span>
                      </div>
                    </div>

                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-slate-800"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeDasharray={200}
                          strokeDashoffset={200 - (200 * result.riskScore) / 100}
                          strokeLinecap="round"
                          className={
                            result.classification === 'High-Risk Fraud'
                              ? 'text-rose-500'
                              : result.classification === 'Suspicious'
                                ? 'text-amber-500'
                                : 'text-emerald-500'
                          }
                          fill="none"
                        />
                      </svg>
                      <span className="absolute font-mono text-xs font-bold text-white">
                        {Math.round(result.riskScore)}%
                      </span>
                    </div>
                  </div>

                  {/* Action Recommendation Banner */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      result.classification === 'High-Risk Fraud'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : result.classification === 'Suspicious'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {result.classification === 'High-Risk Fraud' ? (
                      <AlertOctagon className="w-5 h-5 shrink-0" />
                    ) : result.classification === 'Suspicious' ? (
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    )}
                    <div className="text-xs">
                      <span className="font-bold block">
                        Action: {result.recommendedAction}
                      </span>
                      <span className="text-[11px] opacity-90">{result.explanation}</span>
                    </div>
                  </div>

                  {/* Gemini AI AML Fraud Risk Memorandum */}
                  {result.aiDiagnostics && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 to-slate-950 border border-purple-500/30 text-xs text-purple-200 leading-relaxed space-y-2">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        Gemini 3.8 Flash AML Risk Memorandum:
                      </div>
                      <p className="text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                        {result.aiDiagnostics}
                      </p>
                    </div>
                  )}

                  {/* Anomaly Indicator Breakdown */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Anomaly Risk Factors
                    </span>
                    <div className="space-y-2">
                      {result.anomalyIndicators.map((ind, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200">{ind.name}</span>
                            <span
                              className={`font-mono font-bold ${
                                ind.isTriggered ? 'text-rose-400' : 'text-slate-400'
                              }`}
                            >
                              {ind.score}/100
                            </span>
                          </div>
                          {/* Progress line */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                ind.isTriggered ? 'bg-rose-500' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${ind.score}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400">{ind.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Awaiting Transaction Parameters</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select a test transaction scenario or enter transaction details, then click{' '}
                  <span className="text-cyan-300 font-semibold">Execute Fraud Risk Scoring</span>.
                </p>
                <button
                  onClick={() => handlePredict()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
                >
                  Screen Sample Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch CSV Ledger Mode */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Card Transaction Batch Ingestion
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload daily transaction settlement CSV to identify high-risk anomalies and automated chargeback candidates.
                </p>
              </div>
              <button
                onClick={handleDownloadSampleCsv}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-2 transition shrink-0"
              >
                <Download className="w-4 h-4" />
                Download Sample Fraud CSV
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition bg-slate-950/40 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">
                {batchFile ? batchFile.name : 'Drop credit card transactions CSV here or browse'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Schema: id, amount, timeHour, merchantCategory, distanceFromHomeKm, isInternational, deviceTrustScore
              </p>
            </div>

            {batchError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{batchError}</span>
              </div>
            )}
          </div>

          {batchSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Transactions Audited
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {batchSummary.totalProcessed}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Authorization records</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Flagged Suspicious/Fraud
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {batchSummary.flaggedCount}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-0.5">
                  {batchSummary.flaggedPercentage}% exposure rate
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Average Risk Score
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                  {batchSummary.averageRiskScore} / 100
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Across ledger</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Scoring Pipeline Time
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {batchSummary.executionTimeMs} ms
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Sub-millisecond per txn</div>
              </div>
            </div>
          )}

          {batchResults.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-white uppercase">Filter by Status:</span>
                  <div className="flex gap-1">
                    {['all', 'fraud', 'suspicious', 'legitimate'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setBatchFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                          batchFilter === f
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Search Txn ID or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Txn ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3">Trust</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">Verdict</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {filteredBatchItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{item.id}</td>
                        <td className="p-3 text-emerald-300 font-bold">
                          ${parseFloat(item.data.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-3 font-sans text-slate-300">
                          {item.data.merchantCategory || 'Standard'}
                        </td>
                        <td className="p-3">{item.data.distanceFromHomeKm || '-'} km</td>
                        <td className="p-3">{item.data.deviceTrustScore || '-'}/100</td>
                        <td className="p-3 font-bold">{item.score}</td>
                        <td className="p-3 font-sans text-slate-200">{item.predictedClass}</td>
                        <td className="p-3 text-right font-sans">
                          <RiskBadge level={item.predictedClass as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
