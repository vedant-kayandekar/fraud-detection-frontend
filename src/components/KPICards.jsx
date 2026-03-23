import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Sparkles, Target } from 'lucide-react';

/**
 * Animated counter hook — counts from 0 to target value.
 */
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0 || target === undefined) { setCount(0); return; }
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/**
 * Four animated KPI counter cards.
 */
export default function KPICards({ data }) {
  const totalTxn = useCounter(data?.total_rows || 0);
  const fraudCount = useCounter(data?.fraud_results?.fraud_count || 0);
  const qualityScore = useCounter(data?.data_quality?.quality_score || 0);
  const f1Score = useCounter(
    Math.round((data?.fraud_results?.f1_score || 0) * 100)
  );

  const fraudRate = data?.fraud_results?.fraud_rate || 0;

  const cards = [
    {
      label: 'Total Transactions',
      value: totalTxn.toLocaleString(),
      icon: Activity,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      label: 'Fraud Detected',
      value: `${fraudCount.toLocaleString()} (${fraudRate.toFixed(1)}%)`,
      icon: ShieldAlert,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
    },
    {
      label: 'Data Quality Score',
      value: `${qualityScore}%`,
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
    {
      label: 'Model F1 Score',
      value: `${f1Score}%`,
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="glass-card p-6 animate-slide-up"
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
          <p className="text-sm text-gray-400">{card.label}</p>
          <div className={`h-1 w-full mt-4 rounded-full bg-dark-border overflow-hidden`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-1000`}
              style={{ width: i === 0 ? '100%' : `${Math.min((card.value.toString().replace(/[^0-9.]/g, '') || 0), 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
