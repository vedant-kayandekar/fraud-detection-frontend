import React from 'react';
import UploadZone from '../components/UploadZone';
import { Brain, ShieldCheck, BarChart3, Zap, Activity, Cpu } from 'lucide-react';

/**
 * Landing / Home page — Sentinel Amber design.
 */
export default function Home({ onResult, isAuthenticated }) {
  const stats = [
    { value: '₹485B', label: 'Lost Annually', color: 'text-accent' },
    { value: '84%', label: 'F1 Score Accuracy', color: 'text-ink' },
    { value: 'Under 20s', label: 'Processing Time', color: 'text-accent' },
  ];

  const workflow = [
    { step: 1, title: 'Upload CSV', desc: 'Securely ingest your raw transaction datasets.' },
    { step: 2, title: 'Feature Eng', desc: 'Automated normalization and vectorization of data.' },
    { step: 3, title: 'Analysis', desc: 'Concurrent multi-model fraud risk calculation.' },
    { step: 4, title: 'Dashboard', desc: 'Interactive visualization of identified threats.' },
  ];

  const capabilities = [
    { icon: Cpu, title: 'Multi-model comparison', desc: 'Benchmark performance across XGBoost, Random Forest, and more.' },
    { icon: Brain, title: 'SHAP explainability', desc: 'Understand exactly why a transaction was flagged.' },
    { icon: Activity, title: 'Streaming progress', desc: 'Real-time status updates as your dataset moves through the pipeline.' },
    { icon: ShieldCheck, title: 'Data quality audit', desc: 'Automatic detection of missing values and data drift.' },
    { icon: Zap, title: 'Single transaction predictor', desc: 'Instant inference for individual events via API.' },
    { icon: BarChart3, title: 'Analysis history', desc: 'Immutable logs of past detections for regulatory compliance.' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Navbar ─── */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <span className="font-display text-xl font-bold text-ink tracking-tight">FinLens</span>
        <div className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
          <a href="#" className="hover:text-ink transition-colors">Platform</a>
          <a href="#" className="hover:text-ink transition-colors">Solutions</a>
          <a href="#" className="hover:text-ink transition-colors">Developers</a>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <a href="#upload" className="px-5 py-2.5 text-sm bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors">
              Analyze New File
            </a>
          ) : (
            <>
              <a href="/login" className="px-5 py-2.5 text-sm border border-outline-variant text-ink rounded-lg hover:bg-surface-container transition-colors">
                Sign In
              </a>
              <a href="/login" className="px-5 py-2.5 text-sm bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-ink tracking-tight leading-tight mb-6">
          Detect fraud in your transaction data
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Deploy our sophisticated ML pipeline in minutes. Upload your CSV datasets
          and receive prioritized fraud risk reports powered by our tactical analytical engine.
        </p>
        <div className="flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <a href="#upload" className="px-7 py-3 bg-ink text-white font-medium rounded-lg hover:bg-ink/90 transition-colors text-sm">
              Analyze Dataset
            </a>
          ) : (
            <>
              <a href="/login" className="px-7 py-3 bg-ink text-white font-medium rounded-lg hover:bg-ink/90 transition-colors text-sm">
                Get Started Now
              </a>
              <a href="#workflow" className="px-7 py-3 border border-outline-variant text-ink font-medium rounded-lg hover:bg-surface-container transition-colors text-sm">
                View Documentation
              </a>
            </>
          )}
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="flex flex-col sm:flex-row justify-center gap-6 px-6 max-w-4xl mx-auto py-12">
        {stats.map((s) => (
          <div key={s.label} className="glass-card flex-1 text-center px-8 py-6">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs tracking-[0.15em] text-on-surface-variant uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ─── Workflow ─── */}
      <section id="workflow" className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-2xl font-bold text-ink mb-10">Operational Workflow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {workflow.map((w) => (
            <div key={w.step} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-container-highest flex items-center justify-center font-display font-bold text-accent">
                {w.step}
              </div>
              <p className="text-sm font-semibold text-ink mb-1">{w.title}</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Upload Zone ─── */}
      <section id="upload" className="px-6 py-12 max-w-7xl mx-auto">
        <UploadZone onResult={onResult} />
      </section>

      {/* ─── Capabilities ─── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-ink text-center mb-3">Tactical Capabilities</h2>
        <p className="text-on-surface-variant text-center text-sm mb-10">
          Precision-engineered tools for the modern fraud analyst.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((c) => (
            <div key={c.title} className="glass-card p-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-ink mb-1">{c.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-outline-variant/30 mt-8">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between text-xs text-on-surface-variant">
          <span>© 2024 FinLens Technologies. Built for the Fintech Innovation Hackathon.</span>
          <div className="hidden sm:flex gap-6">
            <a href="#" className="hover:text-ink">Privacy Policy</a>
            <a href="#" className="hover:text-ink">Terms of Service</a>
            <a href="#" className="hover:text-ink">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
