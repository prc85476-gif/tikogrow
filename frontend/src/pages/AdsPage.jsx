import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Sparkles, Tv, ShieldCheck, Clock, CheckCircle2, Zap } from 'lucide-react';

export default function AdsPage() {
  const { ads, config, user, startWatchingAd } = useApp();

  return (
    <div className="px-4 pt-3 pb-28 space-y-4 relative z-10">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2 drop-shadow-sm">
          <Tv className="w-5 h-5 text-cyan-300" />
          <span>Sponsor Engagement</span>
        </h2>
        <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
          Complete 15-second sponsor impressions to earn 10 {config.coinName} tokens per session.
        </p>
      </div>

      {/* Ad Stats Overview Box - White Cards with Glow */}
      <div className="grid grid-cols-2 gap-3">
        <div className="white-box rounded-3xl p-4 glow-card border-l-4 border-l-blue-600">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Completed Sessions</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {user.totalAdsWatched || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-extrabold mt-0.5 inline-block bg-emerald-50 px-2 py-0.5 rounded">
            Verified views
          </span>
        </div>

        <div className="white-box rounded-3xl p-4 glow-card border-l-4 border-l-amber-500">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Earned Tokens</span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            +{(user.totalAdsWatched || 0) * 10} {config.coinName}
          </div>
          <span className="text-[10px] text-slate-500 font-bold mt-0.5 inline-block">
            ≈ ${(((user.totalAdsWatched || 0) * 10) * config.rate).toFixed(3)} USDT
          </span>
        </div>
      </div>

      {/* Reward Rules Highlight - White Card with Blue Glow */}
      <div className="white-box rounded-3xl p-4 flex items-center space-x-3.5 border-l-4 border-l-cyan-500 glow-cyan">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 font-medium leading-relaxed">
          <strong className="text-slate-900 font-extrabold">Instant Settlement: </strong>
          Each completed 15s session credits <span className="font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">10 {config.coinName} Tokens</span> directly into your portfolio!
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-100 drop-shadow-sm px-1">
          Available Sponsor Sessions
        </h3>

        {ads.map((ad, idx) => (
          <div
            key={ad.id || idx}
            className="white-box rounded-3xl p-4.5 glow-card border-l-4 border-l-indigo-600 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-black text-slate-900">{ad.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Sponsor: {ad.sponsor}</p>
                  
                  <div className="flex items-center space-x-2.5 mt-2 text-[11px] font-semibold">
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ad.duration}s</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700 font-black bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                      +{ad.reward || 10} {config.coinName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                Verified Partner
              </span>

              <button
                onClick={() => startWatchingAd(ad)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-black shadow-md shadow-indigo-500/30 flex items-center space-x-1.5 cursor-pointer glow-primary transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Impression</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
