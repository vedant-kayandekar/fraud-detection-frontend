import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Single transaction predictor form with fraud gauge result.
 */
export default function SinglePredictor() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    user_id: 'USR0025',
    transaction_amount: '15000',
    transaction_timestamp: '2024-04-12T03:30:00',
    user_location: 'Mumbai',
    merchant_location: 'Dubai',
    merchant_category: 'Electronics',
    device_id: 'NEW-ABCDEF01',
    device_type: 'mobile',
    payment_method: 'Card',
    account_balance: '0',
    transaction_status: 'success',
    ip_address: '45.33.32.156',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { predictSingle } = await import('../lib/api');
      const res = await predictSingle({
        ...form,
        account_balance: parseFloat(form.account_balance) || 0,
      });
      setResult(res);
    } catch (err) {
      setResult({
        fraud_probability: 0,
        is_fraud: false,
        confidence: 'Error',
        reasons: [{ feature: 'error', value: 0, impact: err.message }],
      });
    }
    setLoading(false);
  };

  const gaugeColor = result
    ? result.fraud_probability > 0.7 ? '#ef4444'
    : result.fraud_probability > 0.4 ? '#f59e0b' : '#22c55e'
    : '#6366f1';

  const fields = [
    { name: 'user_id', label: 'User ID', type: 'text' },
    { name: 'transaction_amount', label: 'Amount (₹)', type: 'text' },
    { name: 'transaction_timestamp', label: 'Timestamp', type: 'datetime-local' },
    { name: 'user_location', label: 'User City', type: 'text' },
    { name: 'merchant_location', label: 'Merchant City', type: 'text' },
    { name: 'merchant_category', label: 'Category', type: 'text' },
    { name: 'device_id', label: 'Device ID', type: 'text' },
    { name: 'device_type', label: 'Device Type', type: 'select', options: ['mobile', 'web', 'ATM'] },
    { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['Card', 'UPI', 'Wallet', 'NetBanking'] },
    { name: 'account_balance', label: 'Account Balance', type: 'number' },
    { name: 'transaction_status', label: 'Status', type: 'select', options: ['success', 'failed', 'pending'] },
    { name: 'ip_address', label: 'IP Address', type: 'text' },
  ];

  return (
    <div className="glass-card animate-slide-up" id="single-predictor">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-white hover:bg-dark-hover/30 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <span className="font-semibold">Single Transaction Predictor</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white
                               focus:border-accent focus:outline-none"
                  >
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white
                               placeholder-gray-500 focus:border-accent focus:outline-none"
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-accent to-purple-600 text-white font-semibold rounded-xl
                           hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Predicting...</> : '🔍 Predict Fraud'}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-6 p-6 bg-dark-bg rounded-xl border border-dark-border animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Gauge */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2d37" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={gaugeColor}
                      strokeWidth="3"
                      strokeDasharray={`${result.fraud_probability * 100} ${100 - result.fraud_probability * 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {(result.fraud_probability * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-400">Risk</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {result.is_fraud ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> FRAUD DETECTED
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> LEGITIMATE
                      </span>
                    )}
                    <span className="text-sm text-gray-400">
                      Confidence: <span className="text-white font-medium">{result.confidence}</span>
                    </span>
                    {result.model_used && (
                      <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">
                        Model: {result.model_used}
                      </span>
                    )}
                    {result.risk_level && (
                      <span className={`px-2 py-1 text-xs rounded-md font-medium
                        ${result.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400'
                        : result.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400'
                        : result.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-green-500/20 text-green-400'}`}>
                        Risk: {result.risk_level}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(result.reasons || []).map((r, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-lg text-xs font-medium
                          ${r.impact === 'high' || r.impact_score > 0.5 ? 'bg-red-500/20 text-red-400'
                          : r.impact === 'medium' || r.impact_score > 0.2 ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'}`}
                      >
                        {r.feature || r} {r.direction ? `(${r.direction})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
