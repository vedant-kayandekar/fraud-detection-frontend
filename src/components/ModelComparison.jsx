import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trophy, Info, Zap, Loader2 } from 'lucide-react';
import { pollComparison } from '../lib/api';

const EXPLAINER_TEXT = `We trained four models on the same data and measured their F1 score — a metric that balances catching real fraud (recall) with avoiding false alarms (precision). Accuracy alone is misleading here because fraud is rare — a model that flags nothing as fraud would still score 92% accuracy. We automatically select the model with the highest F1 score and use it for all predictions shown in this dashboard.`;

function metricColor(val) {
  if (val >= 0.80) return 'text-safe';
  if (val >= 0.60) return 'text-accent';
  return 'text-fraud';
}

const SkeletonCell = () => (
  <div className="h-4 bg-surface-container-highest rounded animate-pulse w-14 mx-auto" />
);

/**
 * Model Comparison — Sentinel Amber design.
 */
export default function ModelComparison({ fraudResults, jobId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    if (!jobId) return;
    const cleanup = pollComparison(
      jobId,
      (data) => setComparisonData(data),
      (data) => setComparisonData(data)
    );
    return cleanup;
  }, [jobId]);

  if (!fraudResults) return null;

  const initialModels = fraudResults.model_comparison || [];
  const models = comparisonData?.models || initialModels;
  const isComplete = comparisonData?.status === 'complete';
  const bestModelName = comparisonData?.best_model_name || fraudResults.best_model_name || 'XGBoost';
  const bestModelF1 = comparisonData?.best_model_f1 || fraudResults.best_model_f1 || 0;

  const completedCount = models.filter(m => m.status === 'complete').length;
  const processingCount = models.filter(m => m.status === 'processing').length;

  let bannerText;
  if (isComplete) {
    bannerText = `Comparison complete. ${bestModelName} achieved the highest F1 score of ${(bestModelF1 * 100).toFixed(1)}% across all models.`;
  } else if (processingCount > 0) {
    bannerText = `XGBoost results used for this dashboard. ${processingCount} model${processingCount > 1 ? 's' : ''} training in background...`;
  } else {
    bannerText = `Automatically selected XGBoost with F1 score of ${(bestModelF1 * 100).toFixed(1)}%.`;
  }

  return (
    <div className="glass-card animate-slide-up" id="model-comparison">
      {/* Collapsed summary */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between text-ink hover:bg-surface-container-low/50 transition-colors rounded-card"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-safe/10 flex-shrink-0">
            {isComplete ? (
              <Trophy className="w-5 h-5 text-safe" />
            ) : (
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
            )}
          </div>
          <div className="text-left min-w-0">
            <span className="font-medium text-sm sm:text-base text-ink">{bannerText}</span>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-on-surface-variant flex-shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant flex-shrink-0 ml-2" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 animate-fade-in">
          {/* Explainer toggle */}
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="mb-4 px-4 py-2 bg-accent/10 rounded-lg text-sm text-accent
                       hover:bg-accent/20 transition-colors flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            How we chose this model
            {showExplainer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showExplainer && (
            <div className="mb-6 p-4 bg-surface-container-low rounded-xl text-sm text-on-surface-variant leading-relaxed">
              {EXPLAINER_TEXT}
            </div>
          )}

          {/* Progress */}
          {!isComplete && (
            <div className="mb-4 flex items-center gap-3 text-sm text-on-surface-variant">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>{completedCount} of {models.length} models complete</span>
              <div className="flex-1 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-700"
                  style={{ width: `${(completedCount / Math.max(models.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Model Name</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">Accuracy</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">Precision</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">Recall</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">F1</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">ROC-AUC</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => {
                  const isDone = model.status === 'complete';
                  const isBest = isComplete ? model.is_best : (model.model_name === 'XGBoost' && !isComplete);

                  return (
                    <tr
                      key={model.model_name}
                      onClick={() => isDone && setSelectedModel(selectedModel === model.model_name ? null : model.model_name)}
                      className={`border-b border-outline-variant/15 transition-all duration-500
                        ${isDone ? 'cursor-pointer' : 'cursor-default'}
                        ${isBest ? 'bg-safe/5 hover:bg-safe/10' : isDone ? 'hover:bg-surface-container-low' : 'opacity-50'}
                        ${selectedModel === model.model_name ? 'ring-1 ring-accent/30' : ''}
                        ${isDone && model.model_name !== 'XGBoost' ? 'animate-fade-in' : ''}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {isBest && <Trophy className="w-4 h-4 text-safe" />}
                          {!isDone && <Loader2 className="w-4 h-4 text-outline animate-spin" />}
                          <span className={`font-medium ${isBest ? 'text-safe' : 'text-ink'}`}>
                            {model.model_name}
                          </span>
                          {isBest && (
                            <span className="px-2 py-0.5 bg-accent/15 text-accent text-[10px] font-semibold rounded-full tracking-wider uppercase">
                              Selected
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDone ? <span className={`font-mono text-sm ${metricColor(model.accuracy)}`}>{model.accuracy.toFixed(3)}</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDone ? <span className={`font-mono text-sm ${metricColor(model.precision)}`}>{model.precision.toFixed(3)}</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDone ? <span className={`font-mono text-sm ${metricColor(model.recall)}`}>{model.recall.toFixed(3)}</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDone ? <span className={`font-mono text-sm font-bold ${metricColor(model.f1_score)}`}>{model.f1_score.toFixed(3)}</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDone ? <span className={`font-mono text-sm ${metricColor(model.roc_auc)}`}>{model.roc_auc.toFixed(3)}</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDone ? (
                          <span className="px-2 py-1 text-xs rounded-md">
                            {model.training_time_seconds ? `${model.training_time_seconds}s` : '✓'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-xs rounded-md flex items-center gap-1 justify-center">
                            <Loader2 className="w-3 h-3 animate-spin" /> Training
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail Panel */}
          {selectedModel && (() => {
            const model = models.find(m => m.model_name === selectedModel);
            if (!model || model.status !== 'complete') return null;

            return (
              <div className="p-5 bg-surface-container-low rounded-xl animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-accent" />
                  <h4 className="text-lg font-semibold text-ink">{model.model_name}</h4>
                  {model.is_best && (
                    <span className="px-2 py-0.5 bg-safe/15 text-safe text-xs rounded-md">Best</span>
                  )}
                  {model.training_time_seconds && (
                    <span className="text-xs text-on-surface-variant">Trained in {model.training_time_seconds}s</span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant mb-5">{model.why_used}</p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Accuracy', value: model.accuracy },
                    { label: 'Precision', value: model.precision },
                    { label: 'Recall', value: model.recall },
                    { label: 'F1 Score', value: model.f1_score },
                    { label: 'ROC-AUC', value: model.roc_auc },
                  ].map(metric => (
                    <div key={metric.label} className="p-3 bg-surface-container-lowest rounded-lg text-center">
                      <p className={`text-xl font-bold ${metricColor(metric.value)}`}>
                        {(metric.value * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
