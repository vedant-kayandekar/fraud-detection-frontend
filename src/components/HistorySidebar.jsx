import React, { useState, useEffect } from 'react';
import { History, LogOut, X, ChevronRight, User } from 'lucide-react';
import { getHistory } from '../lib/api';

/**
 * Collapsible sidebar with analysis history.
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
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 px-2 py-6 bg-dark-card border border-dark-border
                   border-l-0 rounded-r-xl hover:bg-dark-hover transition-colors group"
        id="history-toggle"
      >
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
      </button>

      {/* Sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setIsOpen(false)}>
          <div
            className="w-80 bg-dark-card border-r border-dark-border h-full overflow-y-auto p-6 animate-fade-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-accent" /> History
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 p-3 bg-dark-bg rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-sm text-gray-300 font-medium">My Account</span>
                </div>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-400" title="Log Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No analysis history yet.</p>
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
                        className="w-full p-4 bg-dark-bg rounded-xl border border-dark-border hover:border-accent/30
                                   text-left transition-colors group"
                      >
                        <p className="text-sm font-medium text-white group-hover:text-accent transition-colors truncate">
                          {entry.filename}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{entry.total_rows} rows</span>
                          <span className="text-red-400">{entry.fraud_count} fraud</span>
                          <span>{new Date(entry.upload_time).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
          <div className="flex-1 bg-black/50" />
        </div>
      )}
    </>
  );
}
