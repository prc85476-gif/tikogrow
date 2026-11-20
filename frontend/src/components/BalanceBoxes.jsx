import React from 'react';
import { useApp } from '../context/AppContext';

export default function BalanceBoxes() {
  const { user, currentWithdrawAlert } = useApp();

  return (
    <div className="px-4 mt-2 select-none">
      {/* 3 Uniform Sleek Black Balance Boxes */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* BOX 1: USDT Balance (Pure Black Card) */}
        <div className="bg-[#12141A] border border-white/[0.07] rounded-2xl p-3.5 flex flex-col items-center justify-center min-h-[92px] shadow-lg shadow-black/40 transition-all hover:border-white/15">
          {/* Amount in Bright Green */}
          <div className="text-2xl font-black text-[#00DF8F] tracking-tight font-mono">
            {user.usdtBalance?.toFixed(2) || '0.00'}
          </div>

          {/* Label Badge */}
          <div className="flex items-center space-x-1.5 mt-1.5">
            <img src="/usdt.png" alt="USDT" className="w-4 h-4 rounded-full object-cover shadow-sm shrink-0" />
            <span className="text-xs font-bold text-gray-400">USDT</span>
          </div>
        </div>

        {/* BOX 2: FN coin Balance (Pure Black Card) */}
        <div className="bg-[#12141A] border border-white/[0.07] rounded-2xl p-3.5 flex flex-col items-center justify-center min-h-[92px] shadow-lg shadow-black/40 transition-all hover:border-white/15">
          {/* Amount in Warm Yellow/Gold */}
          <div className="text-2xl font-black text-[#FBBF24] tracking-tight font-mono">
            {user.fgBalance !== undefined ? Math.floor(user.fgBalance) : 0}
          </div>

          {/* Label Badge */}
          <div className="flex items-center space-x-1.5 mt-1.5">
            <img src="/fn_coin.png" alt="FN coin" className="w-4 h-4 rounded-full object-cover shadow-sm shrink-0" />
            <span className="text-xs font-bold text-gray-400">FN coin</span>
          </div>
        </div>

        {/* BOX 3: Done Tasks (Pure Black Card) */}
        <div className="bg-[#12141A] border border-white/[0.07] rounded-2xl p-3.5 flex flex-col items-center justify-center min-h-[92px] shadow-lg shadow-black/40 transition-all hover:border-white/15">
          {/* Amount in Warm Orange */}
          <div className="text-2xl font-black text-[#FF6128] tracking-tight font-mono">
            {user.doneTasksCount || 0}
          </div>

          {/* Label Badge */}
          <div className="flex items-center space-x-1.5 mt-1.5">
            <img src="/blue_check.png" alt="Done" className="w-4 h-4 object-contain shrink-0 drop-shadow-sm" />
            <span className="text-xs font-bold text-gray-400">Done</span>
          </div>
        </div>

      </div>

      {/* Live Ticker Alert */}
      <div className="flex items-center justify-center mt-3 text-xs font-bold text-gray-300">
        <div className="inline-flex items-center space-x-1.5 bg-[#12141A] border border-white/5 rounded-full px-3 py-1 shadow-inner">
          <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
          <span className="text-gray-300 tracking-wide font-medium">
            {currentWithdrawAlert ? (
              <>
                {currentWithdrawAlert.split('WITHDREW')[0]} WITHDREW{' '}
                <strong className="text-[#FF6128] font-bold">
                  {currentWithdrawAlert.split('WITHDREW')[1]}
                </strong>
              </>
            ) : (
              'A***5 JUST WITHDREW 1.9 USDT'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
