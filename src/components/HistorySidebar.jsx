import React, { useState, useEffect } from 'react';
import { History, LogOut, X, ChevronRight, User } from 'lucide-react';
import { getHistory } from '../lib/api';

/**
 * History Sidebar — Sentinel Amber design.
 */
export default function HistorySidebar({ onLoadResult, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 px-2 py-6 bg-surface-container-lowest shadow-ambient
                   rounded-r-xl hover:bg-surface-container transition-colors group"
        id="history-toggle"
      >
        <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-ink transition-colors" />
      </button>

      {/* Sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setIsOpen(false)}>
          <div
            className="w-80 bg-surface-container-low h-full overflow-y-auto p-6 animate-fade-in shadow-ambient-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                History
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 p-3 bg-surface-container rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-sm text-ink font-medium">My Account</span>
                </div>
                <button onClick={onLogout} className="text-on-surface-variant hover:text-fraud transition-colors" title="Log Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-8">No analysis history yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => {
                        if (entry.result_json && onLoadResult) {
                          onLoadResult(entry.result_json);
                          setIsOpen(false);
                        }
                      }}
                      className="w-full p-4 bg-surface-container-lowest rounded-xl
                                 text-left transition-all hover:shadow-ambient group"
                    >
                      <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors truncate">
                        {entry.filename}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(entry.upload_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {entry.fraud_count > 0 && (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded-full">
                            ● {entry.fraud_count} Fraudulent
                          </span>
                        )}
                        {entry.total_rows && (
                          <span className="text-xs text-on-surface-variant">{entry.total_rows.toLocaleString()} rows</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom links */}
            <div className="mt-auto pt-8 space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-ink transition-colors">
                📄 Documentation
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-ink transition-colors">
                🛟 Support
              </a>
            </div>
          </div>
          <div className="flex-1 bg-ink/20 backdrop-blur-sm" />
        </div>
      )}
    </>
  );
}
