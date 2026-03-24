import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Data Quality Report — Sentinel Amber design.
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
    red: { bg: 'bg-fraud/8', text: 'text-fraud', Icon: XCircle },
    amber: { bg: 'bg-accent/8', text: 'text-accent', Icon: AlertTriangle },
    green: { bg: 'bg-safe/8', text: 'text-safe', Icon: CheckCircle },
    blue: { bg: 'bg-blue-600/8', text: 'text-blue-700', Icon: Info },
  };

  const missingCols = quality.missing_per_column || {};

  return (
    <div className="glass-card p-6 animate-slide-up" id="data-quality-report">
      <h3 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
        Data Quality Report
      </h3>

      <div className="space-y-2">
        {items.map((item) => {
          const cfg = severityConfig[item.severity];
          return (
            <div
              key={item.label}
              className="flex items-center justify-between py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <cfg.Icon className={`w-4 h-4 ${cfg.text}`} />
                <span className="text-sm text-on-surface-variant">{item.label}</span>
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
          <h4 className="text-xs font-medium text-on-surface-variant mb-3 uppercase tracking-[0.1em]">
            Missing Values per Column
          </h4>
          <div className="space-y-2">
            {Object.entries(missingCols).slice(0, 10).map(([col, count]) => {
              const pct = Math.min((count / (quality.total_rows || 1)) * 100, 100);
              return (
                <div key={col} className="flex items-center gap-3">
                  <span className="text-xs text-on-surface-variant w-40 truncate">{col}</span>
                  <div className="flex-1 bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-fraud"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
