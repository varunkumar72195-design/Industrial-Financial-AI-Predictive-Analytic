import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Cpu,
  Sliders,
  Database,
  Sparkles,
  User as UserIcon,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { FastApiConfig } from '../../types';
import { auth, googleAuthProvider } from '../../lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { syncUserWithDb } from '../../services/api.ts';

interface HeaderProps {
  config: FastApiConfig;
  onOpenFastApiModal: () => void;
  activeModuleTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenFastApiModal,
  activeModuleTitle,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        await syncUserWithDb(user.uid, user.email, user.displayName || undefined);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user && res.user.email) {
        await syncUserWithDb(res.user.uid, res.user.email, res.user.displayName || undefined);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Active Module Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold hidden sm:inline">
            Predictive Suite
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {activeModuleTitle}
          </h2>
        </div>
      </div>

      {/* Right: Status Pills & Auth */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* PostgreSQL Database Status */}
        <div
          title="Cloud SQL PostgreSQL Database connected and active"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300 font-mono"
        >
          <Database className="w-3 h-3 text-blue-400" />
          <span>Cloud SQL: PostgreSQL</span>
        </div>

        {/* Gemini AI Badge */}
        <div
          title="Gemini 3.8 Flash server-side diagnostic explanations enabled"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300 font-mono"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Gemini 3.8 Flash</span>
        </div>

        {/* Backend Connection Trigger Pill */}
        <button
          onClick={onOpenFastApiModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            config.mode === 'live' && config.isConnected
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-900/90 text-amber-300 border-amber-500/30 hover:border-amber-400/50 hover:bg-slate-800'
          }`}
          title="Click to configure Python FastAPI connection or view API starter code"
        >
          {config.mode === 'live' && config.isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">FastAPI: Live</span>
              <span className="md:hidden">Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Engine: Calibrated</span>
              <span className="md:hidden">Demo</span>
            </>
          )}
          <Sliders className="w-3 h-3 text-slate-400 ml-1" />
        </button>

        {/* User Authentication Pill */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline font-medium truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-rose-400 ml-1 p-0.5 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSigningIn ? 'Connecting...' : 'Sign In'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
