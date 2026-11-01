import React from 'react';
import {
  Activity,
  ShieldAlert,
  BarChart3,
  Award,
  Car,
  Code2,
  TrendingUp,
  Server,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  Cpu,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ModuleKey } from '../common/Sidebar';
import { fetchPredictionHistory, fetchAuditLogs } from '../../services/api.ts';
import { RiskBadge } from '../common/StatusBadge.tsx';

interface DashboardOverviewProps {
  onNavigate: (module: ModuleKey) => void;
  onOpenFastApiModal: () => void;
}

const FLEET_TREND_DATA = [
  { day: 'Mon', healthScore: 95.8, anomalyEvents: 3 },
  { day: 'Tue', healthScore: 94.2, anomalyEvents: 5 },
  { day: 'Wed', healthScore: 96.1, anomalyEvents: 2 },
  { day: 'Thu', healthScore: 93.9, anomalyEvents: 6 },
  { day: 'Fri', healthScore: 95.0, anomalyEvents: 4 },
  { day: 'Sat', healthScore: 97.4, anomalyEvents: 1 },
  { day: 'Sun', healthScore: 96.8, anomalyEvents: 2 },
];

const RECENT_ALERTS = [
  {
    id: 'ALT-8841',
    domain: 'industrial',
    title: 'High Thermal Gradient Warning (HDF)',
    target: 'CNC Spindle #402',
    time: '4 mins ago',
    severity: 'critical',
  },
  {
    id: 'ALT-8840',
    domain: 'financial',
    title: 'Burst Transaction Velocity Spike',
    target: 'Card ending *4912 ($3,420.00)',
    time: '12 mins ago',
    severity: 'high',
  },
  {
    id: 'ALT-8839',
    domain: 'industrial',
    title: 'Tool Wear Approaching 180 min Limit',
    target: 'Lathe Unit #18',
    time: '28 mins ago',
    severity: 'moderate',
  },
  {
    id: 'ALT-8838',
    domain: 'financial',
    title: 'Geographic Disparity Flag (Offshore)',
    target: 'POS Terminal Paris (Cardholder NY)',
    time: '41 mins ago',
    severity: 'high',
  },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenFastApiModal,
}) => {
  const [historyRecords, setHistoryRecords] = React.useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = React.useState<any[]>([]);
  const [activeLedgerTab, setActiveLedgerTab] = React.useState<'predictions' | 'audit'>('predictions');

  React.useEffect(() => {
    fetchPredictionHistory().then(setHistoryRecords);
    fetchAuditLogs().then(setAuditLogsList);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome & Suite Overview Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0c1426] to-[#0a1936] border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              ENTERPRISE AI PREDICTIVE SUITE
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Architecture Baseline
            </span>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Industrial & Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">AI Predictive Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unified intelligence dashboard bridging manufacturing equipment telemetry, real-time credit card fraud risk scoring, machine learning algorithm benchmarking, and valuation models.
            </p>
          </div>

          {/* Integration Status Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AI Analytics Engine: Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>FastAPI Gateway: Configured</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              <Database className="w-4 h-4 text-blue-400" />
              <span>PostgreSQL Schema: Prepared</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Performance Indicator (KPI) Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Industrial Monitored Fleet */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Monitored Machinery
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">1,248</span>
            <span className="text-xs font-semibold text-emerald-400">98.4% Normal</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Critical alerts: 16 units</span>
            <span className="font-mono text-cyan-300">200 Hz feed</span>
          </div>
        </div>

        {/* KPI 2: Financial Screening Volume */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              24h Financial Screening
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">$4.82M</span>
            <span className="text-xs font-semibold text-cyan-400">14.2k txns</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Flagged rate: 0.18%</span>
            <span className="font-mono text-emerald-400">Low Exposure</span>
          </div>
        </div>

        {/* KPI 3: Average Model Latency */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Inference Latency
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">2.1 ms</span>
            <span className="text-xs font-semibold text-blue-400">XGBoost C++</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>LightGBM: 1.4 ms</span>
            <span className="font-mono text-blue-300">Edge Ready</span>
          </div>
        </div>

        {/* KPI 4: Fleet Health Index */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fleet Health Index
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">95.4</span>
            <span className="text-xs font-semibold text-emerald-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Nominal Tolerance</span>
            <span className="font-mono text-emerald-400">+1.2% this week</span>
          </div>
        </div>
      </div>

      {/* Six Modules Quick-Access Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Six Core Predictive Analytics Modules
          </h3>
          <span className="text-xs text-slate-400 font-mono">All Modules Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Machine Health */}
          <div
            onClick={() => onNavigate('machine_health')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 cursor-pointer transition group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">MODULE 01</span>
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                Machine Health Prediction
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyze multi-sensor telemetry (temperature gradients, torque, rotational kinematics, tool wear, and air gap) to diagnose equipment failure risks.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Open Sensor Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module 2: Fraud Detector */}
          <div
            onClick={() => onNavigate('fraud_detection')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 cursor-pointer transition group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">MODULE 02</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                Credit Card Fraud Detection
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Screen financial transactions in real-time. Compute anomaly scores from velocity bursts, cross-border vectors, and device trust signatures.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Launch Fraud Screener</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module 3: Visual Charts */}
          <div
            onClick={() => onNavigate('visual_analytics')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 cursor-pointer transition group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400">MODULE 03</span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
                  <BarChart3 className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                Visual Analytics & Charts
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive failure donuts, diurnal 24h fraud curves, multi-model feature importance rankings, and physical torque vs speed correlation bounds.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Explore Visualizations</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module 4: AI Scoreboard */}
          <div
            onClick={() => onNavigate('model_scoreboard')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 cursor-pointer transition group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">MODULE 04</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                AI Model Scoreboard
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare machine learning algorithms with published benchmark values: Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Inspect Benchmarks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module 5: Car & Income */}
          <div
            onClick={() => onNavigate('car_income')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 cursor-pointer transition group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400">MODULE 05</span>
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
                  <Car className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                Car Price & Income Prediction
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Used vehicle valuation regressor with 5-year depreciation curves, alongside UCI census demographic income tier classification.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Launch Valuations</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module 6: Python Quiz */}
          <div
            onClick={() => onNavigate('python_quiz')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 cursor-pointer transition group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">MODULE 06</span>
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
                  <Code2 className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                Python Practice Quiz
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ten technical multiple-choice questions covering NumPy broadcasting, pandas loc/iloc, scikit-learn stratified splits, and memory management.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Take 10-Question Quiz</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Row: Fleet Trend Chart & Recent Anomaly Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fleet Health Trend Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                7-Day Industrial Fleet Reliability Index
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aggregate vibration, torque, and thermal equilibrium scores across all monitored machining centers
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-cyan-300 border border-slate-800">
              Score: 95.4 / 100
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FLEET_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fleetScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[90, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} / 100`, 'Health Index']}
                />
                <Area
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fleetScoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Anomaly Feed (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              Live Telemetry & Anomaly Feed
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Live Feed
            </span>
          </div>

          <div className="space-y-2.5">
            {RECENT_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400'
                      : alert.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {alert.severity === 'critical' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : alert.domain === 'industrial' ? (
                    <Activity className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 truncate">{alert.title}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{alert.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: PostgreSQL Live Prediction Ledger & Audit Trail */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Cloud SQL PostgreSQL Telemetry & Audit Logs
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Live DB
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveLedgerTab('predictions')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeLedgerTab === 'predictions'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recent Predictions ({historyRecords.length})
            </button>
            <button
              onClick={() => setActiveLedgerTab('audit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeLedgerTab === 'audit'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Audit Trail ({auditLogsList.length})
            </button>
          </div>
        </div>

        {activeLedgerTab === 'predictions' ? (
          historyRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Record ID</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Risk Assessment</th>
                    <th className="p-3">Explanation Summary</th>
                    <th className="p-3">AI Diagnostics</th>
                    <th className="p-3 text-right">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {historyRecords.slice(0, 8).map((rec: any) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">#{rec.id}</td>
                      <td className="p-3 font-sans text-cyan-300 capitalize">
                        {rec.domain?.replace('_', ' ')}
                      </td>
                      <td className="p-3">
                        <span className="font-bold">{rec.riskScore || 0}% </span>
                        <span className="text-[10px] text-slate-400 font-sans">({rec.riskLevel})</span>
                      </td>
                      <td className="p-3 font-sans text-slate-300 max-w-xs truncate">
                        {rec.explanation}
                      </td>
                      <td className="p-3 font-sans text-purple-300 text-[11px] max-w-xs truncate">
                        {rec.aiDiagnostics ? '✓ Gemini Diagnostic Attached' : '—'}
                      </td>
                      <td className="p-3 text-right text-slate-500 text-[11px]">
                        {new Date(rec.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No predictions recorded in PostgreSQL yet. Run an inference in{' '}
              <button
                onClick={() => onNavigate('machine_health')}
                className="text-cyan-300 font-bold underline ml-1"
              >
                Machine Health
              </button>{' '}
              or{' '}
              <button
                onClick={() => onNavigate('fraud_detection')}
                className="text-cyan-300 font-bold underline ml-1"
              >
                Fraud Detector
              </button>{' '}
              to generate records!
            </div>
          )
        ) : (
          auditLogsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Resource</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {auditLogsList.slice(0, 8).map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">LOG-{log.id}</td>
                      <td className="p-3 text-cyan-300 font-bold">{log.action}</td>
                      <td className="p-3 font-sans text-slate-300">{log.resource}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No audit logs recorded yet. Security actions are automatically captured on inference.
            </div>
          )
        )}
      </div>
    </div>
  );
};
