import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, Server, Lock } from 'lucide-react';
import { login, signup } from '../lib/api';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        onLoginSuccess();
      } else {
        await signup(email, password);
        setMessage('Signup successful. You can now log in!');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, title: 'No data stored without your consent', desc: 'Your privacy is our baseline architecture.' },
    { icon: Server, title: 'Processing happens server-side', desc: 'Secure, localized data handling for every request.' },
    { icon: Lock, title: 'Built for financial data privacy', desc: 'Enterprise-grade encryption as standard.' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand + Features */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-surface-container-high px-16 py-12">
        <h1 className="font-display text-4xl font-bold text-ink mb-12 tracking-tight">
          FinLens
        </h1>

        <div className="space-y-8">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">{f.title}</p>
                <p className="text-on-surface-variant text-sm mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-auto text-xs tracking-[0.2em] text-outline uppercase">Tactical Serenity</p>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 bg-surface px-6 py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-10">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                isLogin
                  ? 'text-ink border-b-2 border-accent'
                  : 'text-on-surface-variant hover:text-ink'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                !isLogin
                  ? 'text-ink border-b-2 border-accent'
                  : 'text-on-surface-variant hover:text-ink'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium tracking-[0.1em] text-on-surface-variant mb-2 uppercase">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface-container-highest rounded-lg text-ink
                           placeholder-outline focus:bg-surface-container-lowest
                           focus:ring-1 focus:ring-accent/40 outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-[0.1em] text-on-surface-variant mb-2 uppercase">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface-container-highest rounded-lg text-ink
                           placeholder-outline focus:bg-surface-container-lowest
                           focus:ring-1 focus:ring-accent/40 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-fraud-container rounded-lg text-fraud text-sm text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-safe-container/30 rounded-lg text-safe text-sm text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-ink text-white rounded-lg font-medium
                         hover:bg-ink/90 focus:ring-2 focus:ring-ink/30 focus:outline-none transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <>Sign In <span className="ml-1">→</span></>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant mt-8">
            Secure connection via 256-bit AES encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
