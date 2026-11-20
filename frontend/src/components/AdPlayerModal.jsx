import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, Zap } from 'lucide-react';

export default function AdPlayerModal() {
  const { isAdPlaying, setIsAdPlaying, currentAd, completeAdWatch, config } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isAdPlaying || !currentAd) return;

    setSecondsLeft(currentAd.duration || 15);
    setIsCompleted(false);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdPlaying, currentAd]);

  if (!isAdPlaying || !currentAd) return null;

  const totalDuration = currentAd.duration || 15;
  const progressPercent = Math.min(100, Math.round(((totalDuration - secondsLeft) / totalDuration) * 100));

  const handleClose = () => {
    if (!isCompleted) {
      if (window.confirm('Exiting before completion will forfeit the +10 token reward. Do you want to proceed?')) {
        setIsAdPlaying(false);
      }
    } else {
      setIsAdPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm white-box rounded-3xl overflow-hidden shadow-2xl glow-primary flex flex-col border border-indigo-200">
        {/* Ad Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-sm">
              Verified Sponsor
            </span>
            <span className="text-xs text-indigo-100 font-semibold truncate max-w-[150px]">
              {currentAd.sponsor}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ad Video Simulator Card */}
        <div className="p-5 flex flex-col items-center bg-slate-50">
          <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative flex flex-col items-center justify-center p-4 text-center overflow-hidden shadow-inner border border-indigo-500/30">
            {/* Ambient Glow */}
            <div className="w-20 h-20 rounded-full bg-cyan-400/20 blur-xl absolute pointer-events-none"></div>

            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2.5 shadow-lg shadow-indigo-500/30">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>

            <h4 className="text-base font-extrabold text-white tracking-tight drop-shadow-sm">
              {currentAd.title}
            </h4>
            <p className="text-xs text-indigo-200/80 mt-1 font-medium">
              Verified Web3 Ecosystem • Reward: {currentAd.reward || 10} {config.coinName}
            </p>

            <span className="mt-3 inline-flex items-center text-[11px] text-cyan-300 font-semibold space-x-1 hover:underline cursor-pointer">
              <span>View Partner Platform</span>
              <ExternalLink className="w-3 h-3" />
            </span>

            {/* Countdown Badge overlay */}
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-black text-amber-400 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              {secondsLeft > 0 ? `${secondsLeft}s` : 'VERIFIED'}
            </div>
          </div>

          {/* Progress Bar with Glow */}
          <div className="w-full mt-4">
            <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-bold">
              <span>{isCompleted ? 'Reward Authorization Ready' : 'Verifying sponsor impression...'}</span>
              <span className="font-mono text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-300 ease-linear shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Reward Info Box - White Card with colorful border */}
          <div className="w-full white-box rounded-2xl p-3.5 mt-4 flex items-center justify-between border-l-4 border-l-amber-500">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-extrabold text-slate-900">Session Credit</div>
                <div className="text-[11px] text-slate-500 font-medium">Automatic settlement</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-600 font-mono">
                +{currentAd.reward || 10} {config.coinName}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full mt-4">
            {isCompleted ? (
              <button
                onClick={completeAdWatch}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/30 glow-emerald transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Authorize & Claim +{currentAd.reward || 10} {config.coinName}</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs bg-slate-200 text-slate-500 flex items-center justify-center space-x-2 cursor-not-allowed border border-slate-300"
              >
                <span>Authorization completes in {secondsLeft} seconds...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
