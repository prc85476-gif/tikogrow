import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock } from 'lucide-react';

export default function HeroTaskCard() {
  const { user, setActiveTab } = useApp();

  return (
    <div className="px-4 mt-3">
      <div className="foxtask-card rounded-3xl p-5 relative overflow-hidden">
        {/* Top Meta: Welcome member & Countdown */}
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center space-x-1 font-bold text-gray-200">
            <span className="text-[#FF6128] text-sm">★</span>
            <span>Welcome, member</span>
            <span className="text-[#FBBF24] font-mono">{user.memberNumber || '#802,793'}</span>
          </div>

          <div className="flex items-center space-x-1 text-gray-400 font-medium text-[11px]">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Ends in 2d 23h</span>
          </div>
        </div>

        {/* Content & Illustration Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="max-w-[62%]">
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
              Complete your first task
            </h2>
            <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
              Try to complete your first task and earn USDT and FN Coin rewards
            </p>
          </div>

          {/* Cute Fox in Pink Gift Box Illustration */}
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
            {/* Pink Gift Box Container */}
            <div className="relative flex flex-col items-center">
              {/* Fox Peeking Out */}
              <div className="w-12 h-10 -mb-2 flex items-center justify-center z-10 animate-bounce-short">
                <div className="text-3xl filter drop-shadow">🦊</div>
              </div>

              {/* Gift Box Body */}
              <div className="w-16 h-13 rounded-xl bg-gradient-to-tr from-[#FF5E8E] to-[#FF7EA5] border-2 border-[#FF3370] relative flex items-center justify-center shadow-lg shadow-pink-500/20">
                {/* White Ribbon Cross */}
                <div className="absolute inset-y-0 w-3 bg-white/90"></div>
                <div className="absolute inset-x-0 h-3 bg-white/90"></div>
                {/* Ribbon Bow on top */}
                <div className="absolute -top-3 w-6 h-3 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Big Orange Button: Start > */}
        <div className="mt-5">
          <button
            onClick={() => setActiveTab('tasks')}
            className="w-full py-3.5 rounded-2xl btn-hero-orange text-white text-base font-black flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer"
          >
            <span>Start</span>
            <span className="text-lg leading-none font-bold">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

