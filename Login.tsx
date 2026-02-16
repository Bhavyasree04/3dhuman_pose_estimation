
import React, { useState } from 'react';
import { LogIn, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && pass) onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 mb-4">
            <LogIn className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
            3D Human Pose Estimation
          </h1>
          <p className="text-slate-400 mt-2">Access your motion analysis dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transform transition active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Demo Credentials: Any username/password</p>
        </div>
      </div>
    </div>
  );
};
