import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Data Quality Report showing exact cleaning counts with color-coded severity.
 */
export default function DataQualityReport({ quality }) {
  if (!quality) return null;

  const items = [
    {
      label: 'Duplicate Rows Removed',
      value: quality.duplicate_rows_removed || 0,
      severity: quality.duplicate_rows_removed > 10 ? 'red' : quality.duplicate_rows_removed > 0 ? 'amber' : 'green',
    },
    {
      label: 'Duplicate Transaction IDs',
      value: quality.duplicate_transaction_ids || 0,
      severity: quality.duplicate_transaction_ids > 5 ? 'red' : quality.duplicate_transaction_ids > 0 ? 'amber' : 'green',
    },
    {
      label: 'Amounts Filled from Shadow Column',
      value: quality.missing_amount_filled_from_amt || 0,
      severity: quality.missing_amount_filled_from_amt > 0 ? 'amber' : 'green',
    },
    {
      label: 'Amount Parse Failures',
      value: quality.amount_parse_failures || 0,
      severity: quality.amount_parse_failures > 5 ? 'red' : quality.amount_parse_failures > 0 ? 'amber' : 'green',
    },
    {
      label: 'Timestamp Parse Failures',
      value: quality.timestamp_parse_failures || 0,
      severity: quality.timestamp_parse_failures > 5 ? 'red' : quality.timestamp_parse_failures > 0 ? 'amber' : 'green',
    },
    {
      label: 'City Normalizations Applied',
      value: quality.city_normalizations || 0,
      severity: 'blue',
    },
    {
      label: 'Category Normalizations Applied',
      value: quality.category_normalizations || 0,
      severity: 'blue',
    },
    {
      label: 'Invalid IP Addresses',
      value: quality.invalid_ips || 0,
      severity: quality.invalid_ips > 10 ? 'red' : quality.invalid_ips > 0 ? 'amber' : 'green',
    },
    {
      label: 'Zero Balance Rows',
      value: quality.zero_balance_rows || 0,
      severity: quality.zero_balance_rows > 20 ? 'amber' : 'green',
    },
  ];

  const severityConfig = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', Icon: XCircle },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', Icon: AlertTriangle },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', Icon: CheckCircle },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', Icon: Info },
  };

  // Missing per column
  const missingCols = quality.missing_per_column || {};

  return (
    <div className="glass-card p-6 animate-slide-up" id="data-quality-report">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-accent" />
        Data Quality Report
      </h3>

      <div className="space-y-2">
        {items.map((item) => {
          const cfg = severityConfig[item.severity];
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}
            >
              <div className="flex items-center gap-3">
                <cfg.Icon className={`w-4 h-4 ${cfg.text}`} />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
              <span className={`text-sm font-semibold ${cfg.text}`}>
                {item.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {Object.keys(missingCols).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Missing Values per Column
          </h4>
          <div className="space-y-2">
            {Object.entries(missingCols).slice(0, 10).map(([col, count]) => {
              const pct = Math.min((count / (quality.total_rows || 1)) * 100, 100);
              return (
                <div key={col} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-40 truncate">{col}</span>
                  <div className="flex-1 bg-dark-border rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
