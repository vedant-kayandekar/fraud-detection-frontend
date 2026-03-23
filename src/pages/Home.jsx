import React from 'react';
import UploadZone from '../components/UploadZone';
import { ShieldCheck, Zap, Brain, BarChart3 } from 'lucide-react';

/**
 * Home page with hero section and upload zone.
 */
export default function Home({ onResult }) {
  const features = [
    { icon: Brain, title: 'ML-Powered Detection', desc: 'IsolationForest + XGBoost two-stage detection' },
    { icon: ShieldCheck, title: 'SHAP Explainability', desc: 'Understand why each transaction was flagged' },
    { icon: BarChart3, title: 'Rich Analytics', desc: '6 interactive charts and data quality reports' },
    { icon: Zap, title: 'Fast Processing', desc: 'Handle 100K+ rows in under 30 seconds' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-sm text-accent font-medium">AI-Powered Fraud Detection</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Fraud<span className="text-accent">Guard</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Upload your transaction CSV and instantly detect fraud with
          machine learning, explainable AI, and real-time analytics.
        </p>
      </div>

      {/* Upload */}
      <UploadZone onResult={onResult} />

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl w-full">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass-card p-6 text-center animate-slide-up"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-xl flex items-center justify-center">
              <f.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-xs text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
