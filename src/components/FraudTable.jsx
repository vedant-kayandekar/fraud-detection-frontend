import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

/**
 * Fraud Table — Sentinel Amber design.
 */
export default function FraudTable({ fraudRows = [] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('fraud_rank');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const perPage = 20;

  const filtered = useMemo(() => {
    if (!search) return fraudRows;
    const q = search.toLowerCase();
    return fraudRows.filter((r) =>
      r.user_id?.toLowerCase().includes(q) ||
      r.merchant_category?.toLowerCase().includes(q) ||
      r.transaction_id?.toLowerCase().includes(q)
    );
  }, [fraudRows, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const exportCSV = () => {
    const headers = ['Rank', 'Transaction ID', 'User ID', 'Amount', 'City', 'Category', 'Probability', 'Top Reason'];
    const rows = sorted.map((r) => [
      r.fraud_rank, r.transaction_id, r.user_id,
      r.clean_amount, r.user_city, r.merchant_category,
      r.fraud_probability,
      r.shap_reasons?.[0]?.feature || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraud_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProbColor = (p) => {
    if (p >= 0.8) return 'bg-fraud';
    if (p >= 0.6) return 'bg-accent';
    if (p >= 0.4) return 'bg-amber-400';
    return 'bg-safe';
  };

  const getReasonChipColor = (reason) => {
    const r = reason?.toLowerCase() || '';
    if (r.includes('velocity') || r.includes('amount')) return 'bg-fraud/10 text-fraud';
    if (r.includes('location') || r.includes('geo')) return 'bg-accent/10 text-accent';
    return 'bg-surface-container-highest text-on-surface-variant';
  };

  const SortHeader = ({ label, field }) => (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-ink transition-colors"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </span>
    </th>
  );

  return (
    <div className="glass-card p-6 animate-slide-up" id="fraud-table">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-ink">
            Flagged Transactions
          </h3>
          <span className="px-2 py-0.5 bg-accent/15 text-accent text-xs font-semibold rounded-full">
            {sorted.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 pr-4 py-2 bg-surface-container-highest rounded-lg text-sm text-ink
                         placeholder-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-accent/40
                         outline-none w-56"
              id="fraud-search"
            />
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-outline-variant text-sm text-ink rounded-lg
                       hover:bg-surface-container flex items-center gap-2 transition-colors"
            id="export-csv"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <SortHeader label="User ID" field="user_id" />
              <SortHeader label="Amount" field="clean_amount" />
              <SortHeader label="Date" field="hour_of_day" />
              <SortHeader label="Probability" field="fraud_probability" />
              <th className="px-3 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row.transaction_id + i}
                className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
              >
                <td className="px-3 py-3.5 text-on-surface-variant font-mono text-xs">#{row.user_id}</td>
                <td className="px-3 py-3.5 text-ink font-medium">₹{row.clean_amount?.toLocaleString()}</td>
                <td className="px-3 py-3.5 text-on-surface-variant text-xs">{row.hour_of_day}:00</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-surface-container-highest rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProbColor(row.fraud_probability)}`}
                        style={{ width: `${(row.fraud_probability * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  {row.shap_reasons?.[0] && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getReasonChipColor(row.shap_reasons[0].feature)}`}>
                      {row.shap_reasons[0].feature?.replace(/_/g, ' ')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
          <p className="text-sm text-on-surface-variant">
            Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length} results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === i
                    ? 'bg-ink text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="text-on-surface-variant px-1">…</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setPage(totalPages - 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === totalPages - 1
                    ? 'bg-ink text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
