import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Medal, Award } from 'lucide-react';

export default function FoxRankPage() {
  const { user } = useApp();

  const leaderboards = [
    { rank: 1, name: 'Satoshi***9', usdt: '842.50 USDT', fg: '128,400 FN', badge: '🥇' },
    { rank: 2, name: 'Cyber***7', usdt: '621.10 USDT', fg: '95,120 FN', badge: '🥈' },
    { rank: 3, name: 'Whale***2', usdt: '514.80 USDT', fg: '82,000 FN', badge: '🥉' },
    { rank: 4, name: `${user.firstName || user.username || 'You'} (You)`, usdt: `${user.usdtBalance?.toFixed(2) || '0.00'} USDT`, fg: `${user.fgBalance || 0} FN`, badge: user.memberNumber || '#802,793' },
    { rank: 5, name: 'Alpha***4', usdt: '412.00 USDT', fg: '64,900 FN', badge: '#5' },
    { rank: 6, name: 'Nova***1', usdt: '389.20 USDT', fg: '59,100 FN', badge: '#6' }
  ];

  return (
    <div className="pt-2 px-4 pb-28 select-none space-y-4">
      <div className="flex items-center justify-between text-gray-300 text-sm">
        <span className="font-bold text-white text-base tracking-tight">FoxTask Leaderboard</span>
        <div className="text-gray-400">⋮</div>
      </div>

      {/* Top Banner */}
      <div className="foxtask-card rounded-3xl p-5 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#FF6128]/20 border border-[#FF6128]/40 mx-auto flex items-center justify-center text-[#FF6128] mb-2 shadow-lg shadow-[#FF6128]/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white">Global Earnings Rank</h3>
        <p className="text-xs text-gray-400 mt-1">Top task performers and highest withdrawers</p>
      </div>

      {/* Rank List */}
      <div className="space-y-2.5">
        {leaderboards.map((item) => (
          <div
            key={item.rank}
            className={`foxtask-card rounded-2xl p-4 flex items-center justify-between ${
              item.name.includes('(You)') ? 'border border-[#FF6128]/60 bg-[#FF6128]/5' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-base font-black w-6 text-center text-gray-400">
                {item.badge}
              </span>
              <div>
                <h4 className="text-sm font-black text-white">{item.name}</h4>
                <span className="text-[11px] text-[#FBBF24] font-mono">{item.fg}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-[#00DF8F] font-mono block">
                {item.usdt}
              </span>
              <span className="text-[10px] text-gray-500 font-bold">WITHDRAWN</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

