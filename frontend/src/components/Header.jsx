import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Zap } from 'lucide-react';

export default function Header() {
  const { user } = useApp();

  return (
    <header className="px-4 pt-4 pb-2 flex items-center justify-between relative z-10">
      {/* User profile brief */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/30 ring-2 ring-white/20">
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'N'}
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm shadow-emerald-500/50"></span>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm text-white tracking-tight drop-shadow-sm">
              {user.firstName || 'Nova Member'}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              <ShieldCheck className="w-3 h-3 mr-0.5 inline text-cyan-300" />
              Verified
            </span>
          </div>
          <p className="text-[11px] text-indigo-200/70 font-mono">@{user.username || 'member'}</p>
        </div>
      </div>

      {/* Network Badge with Neon Glow */}
      <div className="flex items-center space-x-1.5 bg-slate-900/60 backdrop-blur-md border border-amber-400/40 rounded-full px-3 py-1 text-[11px] text-amber-300 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]">
        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span>BEP-20</span>
      </div>
    </header>
  );
}
