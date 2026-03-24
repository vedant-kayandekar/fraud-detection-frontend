import React from 'react';
import KPICards from '../components/KPICards';
import ModelComparison from '../components/ModelComparison';
import Charts from '../components/Charts';
import DataQualityReport from '../components/DataQualityReport';
import FraudTable from '../components/FraudTable';
import SinglePredictor from '../components/SinglePredictor';
import { ArrowLeft, Clock } from 'lucide-react';

/**
 * Dashboard page — Sentinel Amber design.
 */
export default function Dashboard({ data, onReset, jobId }) {
  if (!data) return null;

  const effectiveJobId = jobId || data.job_id || data.fraud_results?.job_id;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Bar */}
      <header className="bg-surface-container-lowest shadow-ambient px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-lg font-bold text-ink tracking-tight">FinLens</span>
            {data.filename && (
              <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                📄 {data.filename}
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm border border-outline-variant text-ink rounded-lg
                       hover:bg-surface-container transition-colors"
            id="back-button"
          >
            New Analysis
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Meta info */}
        <div className="mb-6 animate-fade-in">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-ink transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Upload another file
          </button>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <span>📊 {data.total_rows?.toLocaleString()} transactions</span>
            {data.processing_time_seconds && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {data.processing_time_seconds}s
              </span>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-6">
          <KPICards data={data} />
        </div>

        {/* Model Comparison */}
        <div className="mb-6">
          <ModelComparison
            fraudResults={data.fraud_results}
            jobId={effectiveJobId}
          />
        </div>

        {/* Charts + Data Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Charts chartData={data.chart_data} />
          </div>
          <div className="lg:col-span-1">
            <DataQualityReport quality={data.data_quality} />
          </div>
        </div>

        {/* Fraud Table */}
        <div className="mb-6">
          <FraudTable fraudRows={data.fraud_results?.fraud_rows || []} />
        </div>

        {/* Single Predictor */}
        <div className="mb-8">
          <SinglePredictor />
        </div>

        {/* Footer */}
        <footer className="border-t border-outline-variant/30 pt-5 pb-4 text-xs text-on-surface-variant flex items-center justify-between">
          <span>FinLens Pro</span>
          <span>© 2024 FinLens Technologies. Tactical Serenity in Fintech.</span>
        </footer>
      </div>
    </div>
  );
}
