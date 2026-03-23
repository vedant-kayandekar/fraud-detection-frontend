import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trophy, Info, Zap, Loader2 } from 'lucide-react';
import { pollComparison } from '../lib/api';

const EXPLAINER_TEXT = `We trained four models on the same data and measured their F1 score — a metric that balances catching real fraud (recall) with avoiding false alarms (precision). Accuracy alone is misleading here because fraud is rare — a model that flags nothing as fraud would still score 92% accuracy. We automatically select the model with the highest F1 score and use it for all predictions shown in this dashboard.`;

function metricColor(val) {
  if (val >= 0.80) return 'text-green-400';
  if (val >= 0.60) return 'text-amber-400';
  return 'text-red-400';
}

const SkeletonCell = () => (
  <div className="h-4 bg-gray-700 rounded animate-pulse w-14 mx-auto" />
);

/**
 * Model Comparison component with progressive loading.
 * State 1: XGBoost done, others loading (skeleton).
 * State 2: Models filling in progressively via polling.
 * State 3: All complete — shows overall best.
 */
export default function ModelComparison({ fraudResults, jobId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  // Start polling when jobId is available
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

  // Merge initial XGBoost result with polled comparison data
  const initialModels = fraudResults.model_comparison || [];
  const models = comparisonData?.models || initialModels;
  const isComplete = comparisonData?.status === 'complete';
  const bestModelName = comparisonData?.best_model_name || fraudResults.best_model_name || 'XGBoost';
  const bestModelF1 = comparisonData?.best_model_f1 || fraudResults.best_model_f1 || 0;

  const completedCount = models.filter(m => m.status === 'complete').length;
  const processingCount = models.filter(m => m.status === 'processing').length;

  // Banner text
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
        className="w-full p-6 flex items-center justify-between text-white hover:bg-dark-hover/30 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-green-500/10 flex-shrink-0">
            {isComplete ? (
              <Trophy className="w-5 h-5 text-green-400" />
            ) : (
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
            )}
          </div>
          <div className="text-left min-w-0">
            <span className="font-semibold text-sm sm:text-base">{bannerText}</span>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 flex-shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 flex-shrink-0 ml-2" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 animate-fade-in">
          {/* Explainer toggle */}
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent
                       hover:bg-accent/20 transition-colors flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            How we chose this model
            {showExplainer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showExplainer && (
            <div className="mb-6 p-4 bg-dark-bg rounded-xl border border-dark-border text-sm text-gray-300 leading-relaxed">
              {EXPLAINER_TEXT}
            </div>
          )}

          {/* Progress indicator */}
          {!isComplete && (
            <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>{completedCount} of {models.length} models complete</span>
              <div className="flex-1 bg-dark-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-700"
                  style={{ width: `${(completedCount / Math.max(models.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Model</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Accuracy</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Precision</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Recall</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">F1 Score</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">ROC-AUC</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Status</th>
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
                      className={`border-b border-dark-border/50 transition-all duration-500
                        ${isDone ? 'cursor-pointer' : 'cursor-default'}
                        ${isBest ? 'bg-green-500/5 hover:bg-green-500/10' : isDone ? 'hover:bg-dark-hover/50' : 'opacity-60'}
                        ${selectedModel === model.model_name ? 'ring-1 ring-accent/30' : ''}
                        ${isDone && model.model_name !== 'XGBoost' ? 'animate-fade-in' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isBest && <Trophy className="w-4 h-4 text-green-400" />}
                          {!isDone && <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />}
                          <span className={`font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                            {model.model_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isDone ? <span className={`font-mono ${metricColor(model.accuracy)}`}>{(model.accuracy * 100).toFixed(1)}%</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isDone ? <span className={`font-mono ${metricColor(model.precision)}`}>{(model.precision * 100).toFixed(1)}%</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isDone ? <span className={`font-mono ${metricColor(model.recall)}`}>{(model.recall * 100).toFixed(1)}%</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isDone ? <span className={`font-mono font-bold ${metricColor(model.f1_score)}`}>{(model.f1_score * 100).toFixed(1)}%</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isDone ? <span className={`font-mono ${metricColor(model.roc_auc)}`}>{(model.roc_auc * 100).toFixed(1)}%</span> : <SkeletonCell />}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isDone ? (
                          isBest ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-md">
                              SELECTED
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md">
                              {model.training_time_seconds ? `${model.training_time_seconds}s` : '✓'}
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 bg-gray-700/30 text-gray-500 text-xs rounded-md flex items-center gap-1 justify-center">
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
              <div className="p-5 bg-dark-bg rounded-xl border border-dark-border animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-accent" />
                  <h4 className="text-lg font-semibold text-white">{model.model_name}</h4>
                  {model.is_best && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-md">Best</span>
                  )}
                  {model.training_time_seconds && (
                    <span className="text-xs text-gray-500">Trained in {model.training_time_seconds}s</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-5">{model.why_used}</p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Accuracy', value: model.accuracy },
                    { label: 'Precision', value: model.precision },
                    { label: 'Recall', value: model.recall },
                    { label: 'F1 Score', value: model.f1_score },
                    { label: 'ROC-AUC', value: model.roc_auc },
                  ].map(metric => (
                    <div key={metric.label} className="p-3 bg-dark-card rounded-lg text-center">
                      <p className={`text-xl font-bold ${metricColor(metric.value)}`}>
                        {(metric.value * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{metric.label}</p>
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
