import React from 'react';
import KPICards from '../components/KPICards';
import ModelComparison from '../components/ModelComparison';
import Charts from '../components/Charts';
import DataQualityReport from '../components/DataQualityReport';
import FraudTable from '../components/FraudTable';
import SinglePredictor from '../components/SinglePredictor';
import { ArrowLeft, Clock } from 'lucide-react';

/**
 * Dashboard page showing full analysis results.
 * Receives jobId for background model comparison polling.
 */
export default function Dashboard({ data, onReset, jobId }) {
  if (!data) return null;

  // job_id can come from response payload or from prop
  const effectiveJobId = jobId || data.job_id || data.fraud_results?.job_id;

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
            id="back-button"
          >
            <ArrowLeft className="w-4 h-4" /> Upload another file
          </button>
          <h1 className="text-3xl font-bold text-white">
            Fraud Analysis Dashboard
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <span>📄 {data.filename}</span>
            <span>📊 {data.total_rows?.toLocaleString()} transactions</span>
            {data.processing_time_seconds && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {data.processing_time_seconds}s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6">
        <KPICards data={data} />
      </div>

      {/* Model Comparison — progressive loading with polling */}
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
    </div>
  );
}
