'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.access_token, data.user);
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to sign up');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred');
    }
  };

  return (
    <>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden animate-scale-in z-10">
        {/* Decorative ambient glows inside card */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-violet-500/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Create Account
          </h2>
          <p className="text-center text-slate-400 text-sm mb-8 font-medium">
            Join us and start organizing your tasks today
          </p>
        </div>

        <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
              <div className="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20 flex items-center animate-fade-in">
                <svg className="h-5 w-5 text-rose-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-bold text-rose-300">
                    {error}
                </h3>
              </div>
          )}
          
          <div className="space-y-6">
            <div className="group">
              <label htmlFor="full-name" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest group-hover:text-white transition-colors">
                Full Name
              </label>
              <input
                id="full-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none group-hover:border-slate-600"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="group">
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest group-hover:text-white transition-colors">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none group-hover:border-slate-600"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest group-hover:text-white transition-colors">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none group-hover:border-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-800 hover:via-fuchsia-800 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:scale-95"
            >
              Create Account
            </button>
          </div>
        </form>
        <div className="text-sm text-center mt-8 relative z-10">
          <span className="text-slate-400">Already have an account? </span>
          <Link href="/signin" className="font-bold text-violet-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
            Sign in instead
          </Link>
        </div>
      </div>
    </>
  );
}
