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
    <div className="min-h-screen flex items-center justify-center bg-[#A7B59E] text-[#35522B] font-sans p-6">

      <div className="w-full max-w-md bg-[#B8C5AE] p-10 rounded-3xl shadow-lg border-2 border-[#35522B]">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-[#35522B] mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-serif font-bold">
            3D Human Pose
            <span className="block underline underline-offset-8 decoration-[#35522B]">
              Estimation
            </span>
          </h1>

          <p className="mt-3">
            Access your posture intelligence dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Username
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-[#A7B59E] border-2 border-[#35522B] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#35522B] transition"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-[#A7B59E] border-2 border-[#35522B] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#35522B] transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-[#35522B] hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm">
          <p>Demo Credentials: Any username/password</p>
        </div>

      </div>
    </div>
  );
};