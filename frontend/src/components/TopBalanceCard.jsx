import React from 'react';
import { useApp } from '../context/AppContext';
import { Coins, ArrowLeftRight, ArrowUpRight, Play, CheckSquare, Sparkles, TrendingUp } from 'lucide-react';

export default function TopBalanceCard() {
  const { user, config, setActiveTab, ads, startWatchingAd } = useApp();

  const handleQuickWatch = () => {
    if (ads && ads.length > 0) {
      startWatchingAd(ads[0]);
    } else {
      setActiveTab('ads');
    }
  };

  return (
    <div className="mx-4 mt-3 mb-4 relative z-10">
      {/* Top Colorful Gradient Card with Ambient Neon Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-800 to-blue-900 p-5 shadow-2xl shadow-indigo-950/60 border border-indigo-400/40 glow-primary">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header row inside card */}
        <div className="relative flex items-center justify-between text-xs text-indigo-100 mb-2">
          <div className="flex items-center space-x-1.5 font-bold tracking-wider">
            <Coins className="w-4 h-4 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
            <span className="uppercase text-[11px] font-extrabold tracking-wider text-indigo-100">
              Total Holdings
            </span>
          </div>
          <span className="text-[10px] bg-white/20 backdrop-blur-md border border-white/30 text-white px-2.5 py-0.5 rounded-full font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)]">
            1000 {config.coinName} = $1.00 USDT
          </span>
        </div>

        {/* Primary Coin Balance Display with Glow */}
        <div className="relative flex items-baseline space-x-2 my-1">
          <span className="text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)] font-mono">
            {user.novaBalance?.toLocaleString() || 0}
          </span>
          <span className="text-lg font-black text-amber-300 tracking-wider drop-shadow-[0_0_10px_rgba(252,211,77,0.5)]">
            {config.coinName}
          </span>
        </div>

        {/* Converted USDT value pill */}
        <div className="relative flex items-center space-x-2 mt-1 mb-4 text-xs">
          <div className="flex items-center space-x-1 font-bold text-emerald-300 bg-emerald-950/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>≈ ${(user.novaBalance * config.rate).toFixed(4)} USDT</span>
          </div>

          <span className="text-indigo-200/50">•</span>

          <span className="text-indigo-100 font-medium text-[11px]">
            Wallet: <strong className="text-white font-bold">{user.usdtBalance?.toFixed(4) || '0.0000'}</strong> USDT
          </span>
        </div>

        {/* 4 Interactive Buttons in White Color Boxes */}
        <div className="relative grid grid-cols-4 gap-2 pt-3 border-t border-white/15">
          {/* Quick Ad Button - White Color Box */}
          <button
            onClick={handleQuickWatch}
            className="btn-white-box rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white mb-1.5 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">Watch Ad</span>
            <span className="text-[9px] text-amber-600 font-extrabold">+10 {config.coinName}</span>
          </button>

          {/* Tasks Button - White Color Box */}
          <button
            onClick={() => setActiveTab('tasks')}
            className="btn-white-box rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mb-1.5 shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">Tasks</span>
            <span className="text-[9px] text-blue-600 font-extrabold">Bonus</span>
          </button>

          {/* Swap Button - White Color Box */}
          <button
            onClick={() => setActiveTab('exchange')}
            className="btn-white-box rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mb-1.5 shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">Swap</span>
            <span className="text-[9px] text-emerald-600 font-extrabold">To USDT</span>
          </button>

          {/* Withdraw Button - White Color Box */}
          <button
            onClick={() => setActiveTab('withdraw')}
            className="btn-white-box rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-1.5 shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">Withdraw</span>
            <span className="text-[9px] text-purple-600 font-extrabold">BEP-20</span>
          </button>
        </div>
      </div>
    </div>
  );
}
