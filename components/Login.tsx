
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'juan.ortiz@macproducts.net' && password === 'MAC') {
      onLogin(cleanEmail);
    } else {
      setError('Invalid email or password. Please use authorized credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mac-light px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 view-transition">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 items-center justify-center mb-4">
            <img src="/mac_logo.png" alt="MAC Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Command Center Login</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">MAC Email Address</label>
            <input
              type="email"
              placeholder="user@macproducts.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-mac-navy hover:bg-mac-blue text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-mac-blue/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            MAC PRODUCTS INTERNAL SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
};
