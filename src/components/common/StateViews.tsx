import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch, Info, Database, Cpu } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing ML Model Inference...',
  submessage = 'Calculating tensor operations and feature weight contributions...',
}) => {
  return (
    <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[240px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-cyan-400/30 animate-pulse" />
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white tracking-wide">{message}</h4>
        <p className="text-xs text-slate-400 max-w-sm">{submessage}</p>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Inference Pipeline Notice',
  message,
  onRetry,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="flex-1 text-center sm:text-left space-y-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-rose-300/90 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-xs font-semibold text-rose-300 flex items-center gap-2 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Pipeline
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

interface SampleNoticeBannerProps {
  moduleName?: string;
  datasetOrigin?: string;
}

export const SampleNoticeBanner: React.FC<SampleNoticeBannerProps> = () => {
  return null;
};
