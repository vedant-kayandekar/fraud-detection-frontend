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
 * Four animated KPI cards — Sentinel Amber design.
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
      label: 'TOTAL TRANSACTIONS',
      value: totalTxn.toLocaleString(),
      icon: Activity,
      accentClass: 'text-ink',
      iconBg: 'bg-surface-container-highest',
      barColor: 'bg-ink',
    },
    {
      label: 'FRAUD DETECTED',
      value: `${fraudCount.toLocaleString()}`,
      subtitle: `⚠ High risk threshold met`,
      icon: ShieldAlert,
      accentClass: 'text-accent',
      iconBg: 'bg-accent/10',
      barColor: 'bg-accent',
    },
    {
      label: 'DATA QUALITY',
      value: `${qualityScore}%`,
      subtitle: '✓ Optimal schema match',
      icon: Sparkles,
      accentClass: 'text-safe',
      iconBg: 'bg-safe/10',
      barColor: 'bg-safe',
    },
    {
      label: 'F1 SCORE',
      value: `${f1Score}%`,
      subtitle: '▩ Model: XGBoost v2.1',
      icon: Target,
      accentClass: 'text-ink',
      iconBg: 'bg-surface-container-highest',
      barColor: 'bg-ink',
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
          <p className="text-xs tracking-[0.1em] text-on-surface-variant font-medium mb-3">
            {card.label}
          </p>
          <p className={`font-display text-3xl font-bold ${card.accentClass} mb-1`}>
            {card.value}
          </p>
          {card.subtitle && (
            <p className="text-xs text-on-surface-variant">{card.subtitle}</p>
          )}
          <div className="h-1 w-full mt-4 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full rounded-full ${card.barColor} transition-all duration-1000`}
              style={{ width: `${Math.min(parseFloat(card.value.replace(/[^0-9.]/g, '')) || 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
