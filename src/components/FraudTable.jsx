import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

/**
 * Sortable, filterable, paginated table of top fraud transactions.
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
    if (p >= 0.8) return 'bg-red-500';
    if (p >= 0.6) return 'bg-orange-500';
    if (p >= 0.4) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const SortHeader = ({ label, field }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
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
        <h3 className="text-lg font-semibold text-white">
          Top Fraud Transactions ({sorted.length})
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, category, txn..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white
                         placeholder-gray-500 focus:border-accent focus:outline-none w-56"
              id="fraud-search"
            />
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-dark-border hover:bg-dark-hover text-sm text-gray-300 rounded-lg
                       flex items-center gap-2 transition-colors"
            id="export-csv"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <SortHeader label="Rank" field="fraud_rank" />
              <SortHeader label="Transaction ID" field="transaction_id" />
              <SortHeader label="User" field="user_id" />
              <SortHeader label="Amount" field="clean_amount" />
              <SortHeader label="City" field="user_city" />
              <SortHeader label="Category" field="merchant_category" />
              <SortHeader label="Hour" field="hour_of_day" />
              <SortHeader label="Probability" field="fraud_probability" />
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Top Reason</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row.transaction_id + i}
                className="border-b border-dark-border/50 hover:bg-dark-hover/50 transition-colors"
              >
                <td className="px-3 py-3 text-gray-300 font-mono">#{row.fraud_rank}</td>
                <td className="px-3 py-3 text-gray-300 font-mono text-xs">{row.transaction_id}</td>
                <td className="px-3 py-3 text-gray-300">{row.user_id}</td>
                <td className="px-3 py-3 text-white font-medium">₹{row.clean_amount?.toLocaleString()}</td>
                <td className="px-3 py-3 text-gray-300">{row.user_city}</td>
                <td className="px-3 py-3 text-gray-300">{row.merchant_category}</td>
                <td className="px-3 py-3 text-gray-300">{row.hour_of_day}:00</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-dark-border rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProbColor(row.fraud_probability)}`}
                        style={{ width: `${(row.fraud_probability * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      {(row.fraud_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {row.shap_reasons?.[0] && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">
                      {row.shap_reasons[0].feature}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
          <p className="text-sm text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-dark-border hover:bg-dark-hover disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg bg-dark-border hover:bg-dark-hover disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
