import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#d97706', '#92400e', '#b45309', '#78350f', '#a16207', '#854d0e'];
const FRAUD_COLORS = ['#16a34a', '#d97706', '#ba1a1a', '#9333ea', '#0891b2', '#4f46e5'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-lowest rounded-lg p-3 shadow-ambient border border-outline-variant/20">
      <p className="text-sm font-medium text-ink mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, children }) {
  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-xs font-medium text-on-surface-variant mb-4 uppercase tracking-[0.1em]">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function Charts({ chartData }) {
  if (!chartData) return null;

  const {
    fraud_by_category = [],
    fraud_by_hour = [],
    fraud_by_payment_method = [],
    fraud_by_device_type = [],
    daily_fraud_trend = [],
    amount_distribution = [],
  } = chartData;

  const gridColor = '#e7e2d8';
  const axisColor = '#7b766e';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="charts-section">
      {/* 1. Fraud by Category */}
      <ChartCard title="Fraud by Merchant Category">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fraud_by_category} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="number" stroke={axisColor} tick={{ fontSize: 11 }} />
            <YAxis dataKey="category" type="category" stroke={axisColor} tick={{ fontSize: 11 }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="fraud_count" name="Fraud Count" radius={[0, 6, 6, 0]}>
              {fraud_by_category.map((entry, i) => (
                <Cell key={i} fill={entry.fraud_rate > 10 ? '#ba1a1a' : entry.fraud_rate > 5 ? '#d97706' : '#92400e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2. Fraud by Hour */}
      <ChartCard title="Fraud by Hour of Day">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fraud_by_hour}>
            <defs>
              <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="hour" stroke={axisColor} tick={{ fontSize: 11 }} />
            <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" name="Total" stroke="#d97706" fill="url(#hourGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="fraud_count" name="Fraud" stroke="#ba1a1a" fill="url(#dangerGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. Payment Method — Donut */}
      <ChartCard title="Payment Method Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={fraud_by_payment_method} dataKey="total" nameKey="method" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {fraud_by_payment_method.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#4a463f' }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 4. Device Type — Pie */}
      <ChartCard title="Device Type Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={fraud_by_device_type} dataKey="total" nameKey="type" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
              {fraud_by_device_type.map((_, i) => (
                <Cell key={i} fill={FRAUD_COLORS[i % FRAUD_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#4a463f' }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 5. Daily Trend */}
      <ChartCard title="Daily Fraud Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={daily_fraud_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={axisColor} tick={{ fontSize: 10 }} />
            <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#d97706" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fraud_count" name="Fraud" stroke="#ba1a1a" strokeWidth={2} dot={false} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#4a463f' }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 6. Amount Distribution */}
      <ChartCard title="Transaction Amount Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={amount_distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="bucket" stroke={axisColor} tick={{ fontSize: 10 }} />
            <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Transactions" fill="#d97706" radius={[6, 6, 0, 0]}>
              {amount_distribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
