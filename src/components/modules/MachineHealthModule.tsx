import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Upload,
  Download,
  RotateCcw,
  Zap,
  Gauge,
  Thermometer,
  Disc,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  MachineHealthInput,
  MachineHealthResult,
  MachineType,
  FastApiConfig,
  BatchRecordItem,
  BatchSummary,
} from '../../types';
import {
  predictMachineHealth,
  predictBatch,
  generateSampleSensorCsv,
} from '../../services/api';
import { EngineBadge, RiskBadge } from '../common/StatusBadge';

interface MachineHealthModuleProps {
  config: FastApiConfig;
}

const DEFAULT_INPUT: MachineHealthInput = {
  airTemperature: 298.2, // ~25.2 °C
  processTemperature: 308.6, // ~35.6 °C
  rotationalSpeed: 1510, // RPM
  torque: 42.5, // Nm
  toolWear: 45, // min
  airGap: 2.1, // mm
  machineType: 'M',
};

const PRESETS = [
  {
    name: 'Normal Milling (Nominal)',
    description: 'Balanced speed, low wear, safe ΔT',
    data: {
      airTemperature: 298.1,
      processTemperature: 308.5,
      rotationalSpeed: 1520,
      torque: 40.2,
      toolWear: 30,
      airGap: 2.0,
      machineType: 'M' as MachineType,
    },
  },
  {
    name: 'Tool Wear Failure (TWF)',
    description: 'Wear exceeds 210 min safety envelope',
    data: {
      airTemperature: 298.4,
      processTemperature: 308.9,
      rotationalSpeed: 1410,
      torque: 48.0,
      toolWear: 228,
      airGap: 2.2,
      machineType: 'L' as MachineType,
    },
  },
  {
    name: 'Heat Dissipation Warning (HDF)',
    description: 'Insufficient ΔT under low rotational ventilation',
    data: {
      airTemperature: 304.2,
      processTemperature: 308.1, // ΔT only 3.9 K
      rotationalSpeed: 1320,
      torque: 54.0,
      toolWear: 95,
      airGap: 2.4,
      machineType: 'L' as MachineType,
    },
  },
  {
    name: 'Motor Overstrain Risk (OSF)',
    description: 'High torque × tool wear product overload',
    data: {
      airTemperature: 298.9,
      processTemperature: 309.2,
      rotationalSpeed: 1250,
      torque: 76.8, // extreme torque
      toolWear: 185,
      airGap: 1.4,
      machineType: 'L' as MachineType,
    },
  },
];

export const MachineHealthModule: React.FC<MachineHealthModuleProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [form, setForm] = useState<MachineHealthInput>(DEFAULT_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MachineHealthResult | null>(null);

  // Batch states
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchRecordItem[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePredict = async (inputData: MachineHealthInput = form) => {
    setIsLoading(true);
    try {
      const res = await predictMachineHealth(inputData, config);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (presetData: MachineHealthInput) => {
    setForm(presetData);
    handlePredict(presetData);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = generateSampleSensorCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AI4I_2020_Sensor_Batch_Sample.csv');
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
          setBatchError('CSV file appears empty or missing data rows.');
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

        const batchRes = await predictBatch('machine', records, config);
        setBatchResults(batchRes.items);
        setBatchSummary(batchRes.summary);
      } catch (err) {
        console.error('Batch CSV parse error:', err);
      } finally {
        setBatchLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredBatchItems = batchResults.filter((item) => {
    if (batchFilter === 'critical') return item.resultStatus === 'Critical';
    if (batchFilter === 'moderate') return item.resultStatus === 'Moderate';
    if (batchFilter === 'low') return item.resultStatus === 'Low' || item.resultStatus === 'Low Risk';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0b162c] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MODULE 01
            </span>
            <EngineBadge isDemoMode={result ? result.isDemoMode : config.mode === 'demo'} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Industrial Machine Health & Predictive Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Input multi-sensor telemetry (thermal gradients, torque, rotational kinematics, tool wear, and air gap) to predict equipment failure risk and diagnose specific fault modes.
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
            <Activity className="w-3.5 h-3.5" />
            Live Sensor Input
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
            Batch CSV Prediction
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
                Operational Presets (Click to Load)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((p, idx) => (
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

            {/* Sensor Input Panel */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePredict();
              }}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  Industrial Sensor Telemetry Parameters
                </h3>
                <button
                  type="button"
                  onClick={() => setForm(DEFAULT_INPUT)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Air Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      Air Temperature [K]
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.airTemperature} K ({(form.airTemperature - 273.15).toFixed(1)}°C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="290"
                    max="315"
                    step="0.1"
                    value={form.airTemperature}
                    onChange={(e) =>
                      setForm({ ...form, airTemperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>290 K (16.8°C)</span>
                    <span>315 K (41.8°C)</span>
                  </div>
                </div>

                {/* Process Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                      Process Temperature [K]
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.processTemperature} K ({(form.processTemperature - 273.15).toFixed(1)}°C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="325"
                    step="0.1"
                    value={form.processTemperature}
                    onChange={(e) =>
                      setForm({ ...form, processTemperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>300 K (26.8°C)</span>
                    <span>325 K (51.8°C)</span>
                  </div>
                </div>

                {/* Rotational Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Disc className="w-3.5 h-3.5 text-indigo-400" />
                      Rotational Speed [rpm]
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.rotationalSpeed} rpm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1100"
                    max="2900"
                    step="10"
                    value={form.rotationalSpeed}
                    onChange={(e) =>
                      setForm({ ...form, rotationalSpeed: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1,100 rpm</span>
                    <span>2,900 rpm</span>
                  </div>
                </div>

                {/* Torque */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Torque [Nm]
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.torque} Nm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="80"
                    step="0.5"
                    value={form.torque}
                    onChange={(e) => setForm({ ...form, torque: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>3 Nm (No load)</span>
                    <span>80 Nm (Peak)</span>
                  </div>
                </div>

                {/* Tool Wear */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      Tool Wear Accumulation [min]
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.toolWear} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="260"
                    step="1"
                    value={form.toolWear}
                    onChange={(e) => setForm({ ...form, toolWear: parseInt(e.target.value, 10) })}
                    className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 min (Fresh)</span>
                    <span>260 min (Critical)</span>
                  </div>
                </div>

                {/* Air Gap Clearance */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Stator/Rotor Air Gap [mm]
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {form.airGap} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.5"
                    step="0.1"
                    value={form.airGap}
                    onChange={(e) => setForm({ ...form, airGap: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.5 mm (Tight)</span>
                    <span>4.5 mm (Worn)</span>
                  </div>
                </div>
              </div>

              {/* Machine Type Selection */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Machine Quality Variant
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['L', 'M', 'H'] as MachineType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, machineType: type })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        form.machineType === type
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-mono">Type {type}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {type === 'L' ? '(50% low)' : type === 'M' ? '(30% med)' : '(20% high)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Predict Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
                {isLoading ? 'Running ML Inference...' : 'Compute Equipment Failure Risk'}
              </button>
            </form>
          </div>

          {/* Right Column: Prediction Results & Explanation (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Result Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Predictive Assessment
                    </span>
                    <RiskBadge level={result.riskLevel} />
                  </div>

                  {/* Main Score & Risk */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Failure Probability
                      </div>
                      <div className="text-3xl font-extrabold font-mono text-white mt-1">
                        {result.failureRiskScore}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Predicted Mode:{' '}
                        <span className="font-bold text-cyan-300">
                          {result.predictedFailureType}
                        </span>
                      </div>
                    </div>

                    {/* Circular visual gauge preview */}
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
                          strokeDashoffset={200 - (200 * result.failureRiskScore) / 100}
                          strokeLinecap="round"
                          className={
                            result.riskLevel === 'Critical'
                              ? 'text-rose-500'
                              : result.riskLevel === 'Moderate'
                                ? 'text-amber-500'
                                : 'text-emerald-500'
                          }
                          fill="none"
                        />
                      </svg>
                      <span className="absolute font-mono text-xs font-bold text-white">
                        {result.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Operational Derived Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">ΔT (Heat Diss.)</div>
                      <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                        {result.metrics.tempDifference} K
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Power Draw</div>
                      <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                        {result.metrics.powerWatt} W
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Strain Factor</div>
                      <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                        {result.metrics.strainFactor}
                      </div>
                    </div>
                  </div>

                  {/* Explanation Narrative */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-white block mb-1">Diagnosis Explanation:</span>
                    {result.explanation}
                  </div>

                  {/* Gemini AI Deep Engineering Diagnostics */}
                  {result.aiDiagnostics && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 to-slate-950 border border-purple-500/30 text-xs text-purple-200 leading-relaxed space-y-2">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        Gemini 3.8 Flash Engineering Diagnostic:
                      </div>
                      <p className="text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                        {result.aiDiagnostics}
                      </p>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 block">
                      Recommended Engineering Actions:
                    </span>
                    {result.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="text-xs p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sensor Feature Importance Chart */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sensor Feature Importance (SHAP Weighting)
                  </h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={result.sensorImportances}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <XAxis
                          type="number"
                          domain={[0, 0.5]}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="feature"
                          tick={{ fill: '#cbd5e1', fontSize: 10 }}
                          width={110}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                          formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Weight']}
                        />
                        <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                          {result.sensorImportances.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.impact === 'negative'
                                  ? '#ef4444'
                                  : entry.impact === 'positive'
                                    ? '#06b6d4'
                                    : '#64748b'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Normal Tolerance
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500" /> High Anomaly Contribution
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Ready for Sensor Telemetry</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Adjust sensor sliders or choose an operational preset on the left, then click{' '}
                  <span className="text-cyan-300 font-semibold">Compute Equipment Failure Risk</span> to analyze fault boundaries.
                </p>
                <button
                  onClick={() => handlePredict()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
                >
                  Run Baseline Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Prediction CSV Mode */
        <div className="space-y-6">
          {/* CSV Upload & Controls */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Industrial Batch Sensor Ingestion
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload multi-machine CSV logs for concurrent failure classification and risk prioritization.
                </p>
              </div>
              <button
                onClick={handleDownloadSampleCsv}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-2 transition shrink-0"
              >
                <Download className="w-4 h-4" />
                Download Sample Sensor CSV
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition bg-slate-950/40 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">
                {batchFile ? batchFile.name : 'Drop sensor CSV here or browse files'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supports standard columns: airTemperature, processTemperature, rotationalSpeed, torque, toolWear, airGap
              </p>
            </div>

            {batchError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{batchError}</span>
              </div>
            )}
          </div>

          {/* Batch Summary Cards */}
          {batchSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Total Processed
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {batchSummary.totalProcessed}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Telemetry units</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Flagged Failures
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {batchSummary.flaggedCount}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-0.5">
                  {batchSummary.flaggedPercentage}% incident rate
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Mean Risk Score
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                  {batchSummary.averageRiskScore}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Across fleet</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Execution Latency
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {batchSummary.executionTimeMs} ms
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">High-throughput</div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {batchResults.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-white uppercase">Filter by Risk:</span>
                  <div className="flex gap-1">
                    {['all', 'critical', 'moderate', 'low'].map((f) => (
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
                  placeholder="Search Machine ID or failure mode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Record ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Speed [rpm]</th>
                      <th className="p-3">Torque [Nm]</th>
                      <th className="p-3">Tool Wear [min]</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">Predicted Class</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {filteredBatchItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{item.id}</td>
                        <td className="p-3 text-cyan-300">{item.data.machineType || 'M'}</td>
                        <td className="p-3">{item.data.rotationalSpeed || '-'}</td>
                        <td className="p-3">{item.data.torque || '-'}</td>
                        <td className="p-3">{item.data.toolWear || '-'}</td>
                        <td className="p-3 font-bold">{item.score}%</td>
                        <td className="p-3 font-sans text-slate-200">{item.predictedClass}</td>
                        <td className="p-3 text-right font-sans">
                          <RiskBadge level={item.resultStatus as any} />
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
