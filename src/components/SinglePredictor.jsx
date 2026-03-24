import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Single Transaction Predictor — Sentinel Amber design.
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
    ? result.fraud_probability > 0.7 ? '#ba1a1a'
    : result.fraud_probability > 0.4 ? '#d97706' : '#16a34a'
    : '#d97706';

  const fields = [
    { name: 'user_id', label: 'User Account ID', type: 'text' },
    { name: 'transaction_amount', label: 'Transaction Amount', type: 'text' },
    { name: 'transaction_timestamp', label: 'Timestamp', type: 'datetime-local' },
    { name: 'user_location', label: 'User City', type: 'text' },
    { name: 'merchant_location', label: 'Merchant City', type: 'text' },
    { name: 'merchant_category', label: 'Merchant Category', type: 'select', options: ['Electronics', 'Travel', 'Food', 'Fashion', 'Healthcare', 'Entertainment'] },
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
        className="w-full p-6 flex items-center justify-between text-ink hover:bg-surface-container-low/50 transition-colors rounded-card"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <span className="font-semibold text-ink">On-Demand Transaction Analysis</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium tracking-[0.1em] text-on-surface-variant mb-1.5 uppercase">
                  {f.label}
                </label>
                {f.type === 'select' ? (
                  <select
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-surface-container-highest rounded-lg text-sm text-ink
                               focus:bg-surface-container-lowest focus:ring-1 focus:ring-accent/40 outline-none transition-all"
                  >
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-surface-container-highest rounded-lg text-sm text-ink
                               placeholder-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-accent/40 outline-none transition-all"
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-ink text-white font-medium rounded-lg
                           hover:bg-ink/90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyse Transaction'}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-6 p-6 bg-surface-container-low rounded-xl animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Gauge */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e7e2d8" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={gaugeColor}
                      strokeWidth="3"
                      strokeDasharray={`${result.fraud_probability * 100} ${100 - result.fraud_probability * 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-ink">
                      {(result.fraud_probability * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] tracking-[0.15em] text-on-surface-variant uppercase">Probability</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {result.is_fraud ? (
                      <span className="font-display text-lg font-bold text-fraud">
                        High Risk Detected
                      </span>
                    ) : (
                      <span className="font-display text-lg font-bold text-safe">
                        Low Risk — Legitimate
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Model confidence is {result.confidence?.toLowerCase() || 'moderate'} based on recent patterns.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(result.reasons || []).map((r, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                          ${r.impact === 'high' || r.impact_score > 0.5 ? 'bg-fraud/10 text-fraud'
                          : r.impact === 'medium' || r.impact_score > 0.2 ? 'bg-accent/10 text-accent'
                          : 'bg-surface-container-highest text-on-surface-variant'}`}
                      >
                        {(r.feature || r)?.toString().replace(/_/g, ' ')} {r.direction ? `(${r.direction})` : ''}
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
