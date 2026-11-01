import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Clock,
  HardDrive,
  Sliders,
  Info,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { ModelDomain, ModelBenchmark, FastApiConfig } from '../../types';
import { getModelMetrics, PUBLISHED_BENCHMARKS } from '../../services/api';
import { EngineBadge } from '../common/StatusBadge';

interface ModelScoreboardModuleProps {
  config: FastApiConfig;
}

export const ModelScoreboardModule: React.FC<ModelScoreboardModuleProps> = ({ config }) => {
  const [selectedDomain, setSelectedDomain] = useState<ModelDomain>('machine_health');
  const [activeMetric, setActiveMetric] = useState<string>('f1Score');
  const [benchmarks, setBenchmarks] = useState<ModelBenchmark[]>(
    PUBLISHED_BENCHMARKS.machine_health
  );
  const [sourceNote, setSourceNote] = useState<string>(
    'AI4I 2020 Predictive Maintenance (UCI)'
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDomainData(selectedDomain);
  }, [selectedDomain, config]);

  const loadDomainData = async (domain: ModelDomain) => {
    setIsLoading(true);
    // Set sensible default primary metric when domain changes
    if (domain === 'car_price') {
      setActiveMetric('r2Score');
    } else if (domain === 'fraud_detection') {
      setActiveMetric('recall'); // Fraud prioritized on recall to eliminate FN
    } else {
      setActiveMetric('f1Score');
    }

    try {
      const res = await getModelMetrics(domain, config);
      setBenchmarks(res.benchmarks);
      setSourceNote(res.source);
    } catch (e) {
      setBenchmarks(PUBLISHED_BENCHMARKS[domain]);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine the best model for the currently selected metric
  const sortedByMetric = [...benchmarks].sort((a, b) => {
    if (activeMetric === 'latency') {
      return a.inferenceLatencyMs - b.inferenceLatencyMs; // lower is better
    }
    if (activeMetric === 'mae') {
      return (a.mae || 999999) - (b.mae || 999999); // lower is better
    }
    const valA = (a as any)[activeMetric] ?? 0;
    const valB = (b as any)[activeMetric] ?? 0;
    return valB - valA;
  });

  const bestModel = sortedByMetric[0];

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'accuracy':
        return 'Accuracy';
      case 'precision':
        return 'Precision';
      case 'recall':
        return 'Recall (Sensitivity)';
      case 'f1Score':
        return 'F1-Score';
      case 'rocAuc':
        return 'ROC-AUC';
      case 'prAuc':
        return 'PR-AUC';
      case 'r2Score':
        return 'R² Coefficient';
      case 'mae':
        return 'Mean Absolute Error ($)';
      case 'latency':
        return 'Inference Latency (ms)';
      default:
        return key;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e172a] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MODULE 04
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Rigorous Empirical Benchmarks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            AI Model Scoreboard & Algorithm Benchmark
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Compare production machine learning models (XGBoost, Random Forest, LightGBM, SVM, Autoencoders) across standard validation metrics. Transparent benchmark figures grounded in published research datasets.
          </p>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setSelectedDomain('machine_health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedDomain === 'machine_health'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Machine Health
          </button>
          <button
            onClick={() => setSelectedDomain('fraud_detection')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedDomain === 'fraud_detection'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fraud Detection
          </button>
          <button
            onClick={() => setSelectedDomain('car_price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedDomain === 'car_price'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Car Price
          </button>
          <button
            onClick={() => setSelectedDomain('income_classification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedDomain === 'income_classification'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Census Income
          </button>
        </div>
      </div>

      {/* Metric Selector Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Primary Optimization Metric:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedDomain === 'car_price' ? (
            <>
              {['r2Score', 'mae', 'latency'].map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    activeMetric === m
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {getMetricLabel(m)}
                </button>
              ))}
            </>
          ) : (
            <>
              {['f1Score', 'recall', 'precision', 'rocAuc', 'accuracy', 'latency'].map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    activeMetric === m
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {getMetricLabel(m)}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Best Performing Model Highlight Card */}
      {bestModel && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-400/20">
                  <Trophy className="w-3.5 h-3.5" />
                  Best Model for {getMetricLabel(activeMetric)}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {bestModel.family}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {bestModel.name}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                {bestModel.notes}
              </p>
            </div>

            {/* Metric pill */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Score on {getMetricLabel(activeMetric)}
              </div>
              <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                {activeMetric === 'latency'
                  ? `${bestModel.inferenceLatencyMs} ms`
                  : activeMetric === 'mae'
                    ? `$${bestModel.mae?.toLocaleString()}`
                    : activeMetric === 'r2Score'
                      ? bestModel.r2Score?.toFixed(3)
                      : `${(((bestModel as any)[activeMetric] || 0) * 100).toFixed(1)}%`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Latency: <span className="text-white font-mono">{bestModel.inferenceLatencyMs} ms</span> • Footprint: <span className="text-white font-mono">{bestModel.modelSizeMb} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Algorithm Comparison: {getMetricLabel(activeMetric)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Source: {sourceNote}
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={benchmarks}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                domain={
                  activeMetric === 'latency'
                    ? [0, 15]
                    : activeMetric === 'mae'
                      ? [0, 4000]
                      : [0.5, 1.0]
                }
                tickFormatter={(v) =>
                  activeMetric === 'latency'
                    ? `${v}ms`
                    : activeMetric === 'mae'
                      ? `$${v}`
                      : `${(v * 100).toFixed(0)}%`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [
                  activeMetric === 'latency'
                    ? `${val} ms`
                    : activeMetric === 'mae'
                      ? `$${val}`
                      : `${(Number(val) * 100).toFixed(2)}%`,
                  getMetricLabel(activeMetric),
                ]}
              />
              <Bar dataKey={activeMetric === 'latency' ? 'inferenceLatencyMs' : activeMetric} radius={[6, 6, 0, 0]}>
                {benchmarks.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.id === bestModel?.id ? '#06b6d4' : '#334155'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Leaderboard Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Complete Benchmark Metric Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Rank / Model</th>
                <th className="p-3">Family</th>
                {selectedDomain !== 'car_price' ? (
                  <>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Precision</th>
                    <th className="p-3">Recall</th>
                    <th className="p-3">F1-Score</th>
                    <th className="p-3">ROC-AUC</th>
                  </>
                ) : (
                  <>
                    <th className="p-3">R² Score</th>
                    <th className="p-3">MAE ($)</th>
                    <th className="p-3">RMSE ($)</th>
                  </>
                )}
                <th className="p-3">Inference</th>
                <th className="p-3">Footprint</th>
                <th className="p-3 text-right">Dataset Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {sortedByMetric.map((model, idx) => {
                const isBest = model.id === bestModel?.id;
                return (
                  <tr
                    key={model.id}
                    className={`transition ${
                      isBest ? 'bg-cyan-500/10 hover:bg-cyan-500/15' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white font-sans">{model.name}</span>
                        {isBest && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold font-sans">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-sans text-slate-400 text-[11px]">{model.family}</td>
                    {selectedDomain !== 'car_price' ? (
                      <>
                        <td className="p-3">{((model.accuracy || 0) * 100).toFixed(1)}%</td>
                        <td className="p-3">{((model.precision || 0) * 100).toFixed(1)}%</td>
                        <td className="p-3 font-bold text-cyan-300">
                          {((model.recall || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="p-3 font-bold text-white">
                          {((model.f1Score || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="p-3">{(model.rocAuc || 0).toFixed(3)}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-bold text-cyan-300">
                          {model.r2Score?.toFixed(3)}
                        </td>
                        <td className="p-3">${model.mae?.toLocaleString()}</td>
                        <td className="p-3">${model.rmse?.toLocaleString()}</td>
                      </>
                    )}
                    <td className="p-3 text-emerald-400">{model.inferenceLatencyMs} ms</td>
                    <td className="p-3">{model.modelSizeMb} MB</td>
                    <td className="p-3 text-right font-sans text-[11px] text-slate-400 truncate max-w-xs">
                      {model.trainingDataset}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
