'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Incorrect password.');
      }

      // Refresh to trigger middleware re-evaluating the cookie
      router.refresh();
      
      // Navigate to dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 md:py-24">
      <div className="glass-panel rounded-2xl p-8 shadow-xl shadow-rose-950/5 relative overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="text-center space-y-2 mb-8 relative">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 id="admin-login-title" className="text-2xl font-bold text-zinc-100">Admin Control Center</h1>
          <p className="text-xs text-zinc-400">Please enter the administrator password to manage system settings and view logs.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-zinc-400">
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoFocus
              className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-850 focus:border-rose-500/50 rounded-xl text-zinc-100 placeholder-zinc-600 outline-none text-sm focus:ring-1 focus:ring-rose-500/20 transition-all"
            />
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-gradient-instagram text-white font-semibold text-sm shadow-lg shadow-rose-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
