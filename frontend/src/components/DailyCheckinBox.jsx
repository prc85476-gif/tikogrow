import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export default function DailyCheckinBox() {
  const { user, claimDailyCheckin, setActiveTab, setSelectedCategory } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const isCheckedIn = user.lastCheckInDate === today;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCheckIn = async () => {
    setIsAnimating(true);
    await claimDailyCheckin();
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handleClaimAds = () => {
    setSelectedCategory('ads');
    setActiveTab('tasks');
  };

  return (
    <div className="px-4 mt-3 overflow-hidden select-none">
      <div className="relative min-h-[74px]">
        {!isCheckedIn ? (
          /* Card 1: Daily Check-in (Active, awards 0.002$ USDT) */
          <div
            className={`foxtask-card rounded-2xl p-4 flex items-center justify-between border border-white/5 transition-all duration-500 transform ${
              isAnimating ? '-translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'
            }`}
          >
            {/* Left Side */}
            <div>
              <div className="flex items-center space-x-1.5 text-sm font-extrabold text-white">
                <span>Daily Check-in</span>
                <span className="text-gray-400 font-bold">›</span>
              </div>

              <div className="mt-1.5 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF6128] via-[#FF7835] to-[#FFA03E] text-white text-[11px] font-black shadow-md shadow-[#FF6128]/30 tracking-tight">
                <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>+0.002 USDT</span>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-[#1A1D27] border border-white/5 rounded-full px-2.5 py-1 text-xs font-bold text-gray-300">
                <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span className="font-mono">0</span>
              </div>

              <button
                onClick={handleCheckIn}
                className="btn-orange-3d px-4 py-2 rounded-xl text-xs font-black tracking-wide cursor-pointer transition-all active:scale-95 shadow-md flex items-center space-x-1"
              >
                <span>CHECK IN +</span>
              </button>
            </div>
          </div>
        ) : (
          /* Card 2: Claim 0.15$ Reward (Slides in after Daily Check-in is done) */
          <div className="foxtask-card rounded-2xl p-4 flex items-center justify-between border border-[#00DF8F]/25 bg-gradient-to-r from-[#121620] via-[#151d27] to-[#121b22] transition-all duration-500 transform animate-in slide-in-from-right fade-in shadow-lg">
            {/* Left Side with Google Ads logo & Claim info */}
            <div className="flex items-center space-x-3">
              <img src="/ads_logo.png" alt="Ads" className="w-10 h-10 object-contain shrink-0" />

              <div>
                <div className="flex items-center space-x-1 text-sm font-extrabold text-white">
                  <span>Claim 0.15$ Reward</span>
                  <span className="text-[#00DF8F] text-xs">✨</span>
                </div>

                <div className="flex items-center space-x-1.5 text-[#00DF8F] text-xs font-black mt-1 tracking-tight">
                  <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                  <span>+0.15 USDT Daily Ads</span>
                </div>
              </div>
            </div>

            {/* Right Side (CLAIM Button) */}
            <button
              onClick={handleClaimAds}
              className="btn-orange-3d px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer shadow-md shadow-[#FF6128]/30 flex items-center space-x-1.5 active:scale-95 hover:scale-105 transition-transform"
            >
              <span>CLAIM</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
