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
    <div className="min-h-screen flex items-center justify-center bg-white text-amber-600 font-sans p-6">

      <div className="w-full max-w-md bg-amber-50 p-10 rounded-3xl shadow-lg border-2 border-amber-600">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-amber-600 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900">
            3D Human Pose
            <span className="block underline underline-offset-8 decoration-amber-600">
              Estimation
            </span>
          </h1>

          <p className="mt-3 text-gray-600">
            Access your posture intelligence dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-800">
              Username
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-white border-2 border-amber-600 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-600 transition text-gray-800 placeholder:text-gray-400"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-800">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-white border-2 border-amber-600 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-600 transition text-gray-800 placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Demo Credentials: Any username/password</p>
        </div>

      </div>
    </div>
  );
};