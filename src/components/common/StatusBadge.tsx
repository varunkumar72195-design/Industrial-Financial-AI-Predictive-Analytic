import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Cpu, Database, CheckCircle2 } from 'lucide-react';

interface EngineBadgeProps {
  isDemoMode?: boolean;
  className?: string;
}

export const EngineBadge: React.FC<EngineBadgeProps> = ({ isDemoMode = true, className = '' }) => {
  if (isDemoMode) {
    return (
      <span
        title="Running on calibrated baseline machine learning engine. Connect FastAPI in settings for live Python model execution."
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <Database className="w-3 h-3 text-amber-400" />
        Demo Engine: Calibrated ML
      </span>
    );
  }

  return (
    <span
      title="Connected to external Python FastAPI backend with live model weights."
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <Cpu className="w-3 h-3 text-emerald-400" />
      FastAPI Live Python Model
    </span>
  );
};

interface RiskBadgeProps {
  level: 'Low' | 'Moderate' | 'Critical' | 'Legitimate' | 'Suspicious' | 'High-Risk Fraud' | 'Fraud';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showIcon = true }) => {
  switch (level) {
    case 'Low':
    case 'Legitimate':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {showIcon && <CheckCircle2 className="w-3 h-3" />}
          {level}
        </span>
      );
    case 'Moderate':
    case 'Suspicious':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          {showIcon && <AlertTriangle className="w-3 h-3" />}
          {level}
        </span>
      );
    case 'Critical':
    case 'High-Risk Fraud':
    case 'Fraud':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          {showIcon && <AlertOctagon className="w-3 h-3" />}
          {level}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
          {level}
        </span>
      );
  }
};
