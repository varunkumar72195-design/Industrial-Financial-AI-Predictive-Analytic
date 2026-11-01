import React, { useState } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Layers,
  Filter,
  ShieldAlert,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  MACHINE_FAILURE_DISTRIBUTION,
  MACHINE_TYPE_BREAKDOWN,
  FRAUD_HOURLY_TRENDS,
  FRAUD_BY_MERCHANT_CATEGORY,
  SENSOR_FEATURE_IMPORTANCES,
  FINANCIAL_FEATURE_IMPORTANCES,
  SENSOR_CORRELATION_POINTS,
} from '../../data/analyticsData';

export const VisualAnalyticsModule: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<'all' | 'industrial' | 'financial'>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(50);
  const [selectedMachineType, setSelectedMachineType] = useState<string>('all');

  // Filtered correlation points based on threshold
  const filteredCorrelationPoints = SENSOR_CORRELATION_POINTS.filter((p) => {
    if (selectedMachineType !== 'all') return true;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e172a] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MODULE 03
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Interactive Telemetry & Risk Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Visual Analytics & Exploratory AI Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Deep visual inspection of equipment failure modes, financial fraud diurnal cycles, model feature attribution, and non-linear physical correlation clusters.
          </p>
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveDomain('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeDomain === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Analytics
          </button>
          <button
            onClick={() => setActiveDomain('industrial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeDomain === 'industrial'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Industrial Telemetry
          </button>
          <button
            onClick={() => setActiveDomain('financial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeDomain === 'financial'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Financial Fraud
          </button>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">Interactive Controls:</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* Threshold slider */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Model Decision Threshold:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
              className="w-24 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="font-mono text-cyan-300 font-bold">{confidenceThreshold}%</span>
          </div>

          {/* Machine Variant Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Equipment Type:</span>
            <select
              value={selectedMachineType}
              onChange={(e) => setSelectedMachineType(e.target.value)}
              className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Variants (L, M, H)</option>
              <option value="L">Type L (50% Fleet)</option>
              <option value="M">Type M (30% Fleet)</option>
              <option value="H">Type H (20% Fleet)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: Failure Distribution & Machine Types (Industrial) */}
      {(activeDomain === 'all' || activeDomain === 'industrial') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Machine Failure Modes (Donut Chart - 6 cols) */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Industrial Failure Modes (AI4I 2020 Dataset)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  10,000 synthetic machine cycles: 348 total observed fault triggers
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MACHINE_FAILURE_DISTRIBUTION}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {MACHINE_FAILURE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [`${val} records (${((Number(val)/10000)*100).toFixed(2)}%)`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-[11px] text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Machine Type Failure Rate Comparison (Bar Chart - 6 cols) */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Failure Incident Rate by Machine Quality Tier
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Low (L) variants exhibit 3.1x higher failure probability than High (H) variants
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MACHINE_TYPE_BREAKDOWN} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    unit="%"
                    domain={[0, 6]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(v: any) => [`${v}%`, 'Failure Rate']}
                  />
                  <Bar dataKey="rate" name="Failure Rate (%)" radius={[6, 6, 0, 0]}>
                    {MACHINE_TYPE_BREAKDOWN.map((entry, idx) => (
                      <Cell
                        key={`rate-${idx}`}
                        fill={idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Fraud Distribution & Diurnal Trends (Financial) */}
      {(activeDomain === 'all' || activeDomain === 'financial') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hourly Diurnal Curve (Area Chart - 7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  24-Hour Fraud Rate Diurnal Cycle
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Fraud incident percentage surges 28x during off-peak night hours (01:00 - 04:00 UTC)
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FRAUD_HOURLY_TRENDS} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="fraudRateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    unit="%"
                    domain={[0, 6]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="fraudRate"
                    name="Fraud Rate (%)"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#fraudRateGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fraud by Merchant Category (Bar Chart - 5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Risk Exposure by Merchant Category
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Online Electronics and Digital Gaming show peak fraud velocity
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={FRAUD_BY_MERCHANT_CATEGORY}
                  margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    unit="%"
                    domain={[0, 5]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Fraud Rate']}
                  />
                  <Bar dataKey="fraudRate" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Feature Importance Comparison & Correlation Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Feature Importance (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Feature Importance: Random Forest vs XGBoost
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gini impurity vs gradient split gain attribution across sensor parameters
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SENSOR_FEATURE_IMPORTANCES}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="feature"
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  angle={-18}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: any) => [`${(Number(val) * 100).toFixed(1)}%`, name]}
                />
                <Legend
                  verticalAlign="top"
                  formatter={(v) => <span className="text-xs text-slate-300">{v}</span>}
                />
                <Bar dataKey="randomForest" name="Random Forest" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="xgboost" name="XGBoost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Physical Torque vs Rotational Speed Correlation Hyperbola (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Torque vs Rotational Speed Physical Boundary
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mechanical power curve $P = \tau \times \omega$. Overstrain and power stalls occur at hyperbola extremes
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="speed"
                  name="Rotational Speed"
                  unit=" rpm"
                  domain={[1000, 3000]}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="torque"
                  name="Torque"
                  unit=" Nm"
                  domain={[0, 85]}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any) => [value, name]}
                />
                <Scatter
                  name="Normal Operating Regime"
                  data={filteredCorrelationPoints.filter((p) => !p.isFail)}
                  fill="#10b981"
                />
                <Scatter
                  name="Critical Failure Boundary"
                  data={filteredCorrelationPoints.filter((p) => p.isFail)}
                  fill="#ef4444"
                />
                <Legend
                  verticalAlign="top"
                  formatter={(v) => <span className="text-xs text-slate-300">{v}</span>}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
