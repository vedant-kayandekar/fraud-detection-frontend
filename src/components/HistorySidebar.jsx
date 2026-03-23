import React, { useState, useEffect } from 'react';
import { History, LogIn, LogOut, X, ChevronRight, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Collapsible sidebar with Supabase auth + analysis history.
 */
export default function HistorySidebar({ onLoadResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isOpen) fetchHistory();
  }, [user, isOpen]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { getHistory: fetchHist } = await import('../lib/api');
      const data = await fetchHist(user.id);
      setHistory(data);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) { setLoginError('Supabase not configured'); return; }
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setShowLogin(false);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleSignup = async () => {
    if (!supabase) { setLoginError('Supabase not configured'); return; }
    setLoginError('');
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setLoginError('Check your email for confirmation.');
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
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

            {!user ? (
              <div>
                {!showLogin ? (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl text-accent font-medium
                               flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Sign In to View History
                  </button>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <input
                      type="email" placeholder="Email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white
                                 placeholder-gray-500 focus:border-accent focus:outline-none"
                    />
                    <input
                      type="password" placeholder="Password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white
                                 placeholder-gray-500 focus:border-accent focus:outline-none"
                    />
                    {loginError && <p className="text-xs text-red-400">{loginError}</p>}
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      type="button" onClick={handleSignup}
                      className="w-full px-4 py-2 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-hover transition-colors"
                    >
                      Sign Up Instead
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 p-3 bg-dark-bg rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    <span className="text-sm text-gray-300 truncate">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-400">
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
            )}
          </div>
          <div className="flex-1 bg-black/50" />
        </div>
      )}
    </>
  );
}
