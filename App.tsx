
import React, { useState, useEffect } from 'react';
import { AppState, User } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { MotionAnalysis } from './components/MotionAnalysis';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.LOGIN);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('kinetic_user');
    if (savedUser) {
      setUser({ username: savedUser, isLoggedIn: true });
      setCurrentState(AppState.DASHBOARD);
    }
  }, []);

  const handleLogin = (username: string) => {
    const newUser = { username, isLoggedIn: true };
    setUser(newUser);
    localStorage.setItem('kinetic_user', username);
    setCurrentState(AppState.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kinetic_user');
    setCurrentState(AppState.LOGIN);
  };

  const navigateTo = (state: any) => {
    if (state === 'live_demo') setCurrentState(AppState.LIVE_DEMO);
    else if (state === 'video_demo') setCurrentState(AppState.VIDEO_DEMO);
    else setCurrentState(AppState.DASHBOARD);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {currentState === AppState.LOGIN && (
        <Login onLogin={handleLogin} />
      )}

      {currentState === AppState.DASHBOARD && user && (
        <Dashboard 
          username={user.username} 
          onNavigate={navigateTo} 
          onLogout={handleLogout} 
        />
      )}

      {currentState === AppState.LIVE_DEMO && (
        <MotionAnalysis mode="live" onBack={() => setCurrentState(AppState.DASHBOARD)} />
      )}

      {currentState === AppState.VIDEO_DEMO && (
        <MotionAnalysis mode="video" onBack={() => setCurrentState(AppState.DASHBOARD)} />
      )}
    </main>
  );
};

export default App;
