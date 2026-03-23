import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5'];
const FRAUD_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
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
      <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">{title}</h3>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="charts-section">
      {/* 1. Fraud by Category — Horizontal Bar */}
      <ChartCard title="Fraud by Merchant Category">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fraud_by_category} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d37" />
            <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis dataKey="category" type="category" stroke="#6b7280" tick={{ fontSize: 11 }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="fraud_count" name="Fraud Count" radius={[0, 6, 6, 0]}>
              {fraud_by_category.map((entry, i) => (
                <Cell key={i} fill={entry.fraud_rate > 10 ? '#ef4444' : entry.fraud_rate > 5 ? '#f59e0b' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2. Fraud by Hour — Area Chart */}
      <ChartCard title="Fraud by Hour of Day">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fraud_by_hour}>
            <defs>
              <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d37" />
            <XAxis dataKey="hour" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#6366f1"
              fill="url(#hourGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="fraud_count"
              name="Fraud"
              stroke="#ef4444"
              fill="url(#dangerGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. Payment Method — Donut Chart */}
      <ChartCard title="Payment Method Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fraud_by_payment_method}
              dataKey="total"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {fraud_by_payment_method.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 4. Device Type — Pie Chart */}
      <ChartCard title="Device Type Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fraud_by_device_type}
              dataKey="total"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={90}
              paddingAngle={2}
            >
              {fraud_by_device_type.map((_, i) => (
                <Cell key={i} fill={FRAUD_COLORS[i % FRAUD_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 5. Daily Fraud Trend — Line Chart */}
      <ChartCard title="Daily Fraud Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={daily_fraud_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d37" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="fraud_count"
              name="Fraud"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 6. Amount Distribution — Histogram */}
      <ChartCard title="Transaction Amount Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={amount_distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d37" />
            <XAxis dataKey="bucket" stroke="#6b7280" tick={{ fontSize: 10 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Transactions" fill="#6366f1" radius={[6, 6, 0, 0]}>
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
