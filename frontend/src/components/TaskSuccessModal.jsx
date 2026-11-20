import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';

export default function TaskSuccessModal() {
  const { taskSuccessModal, closeTaskSuccessModal } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (taskSuccessModal?.visible) {
      // Small timeout to guarantee DOM is rendered before triggering CSS transition
      const enterTimer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);

      const autoCloseTimer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(closeTaskSuccessModal, 300);
      }, 3500);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(autoCloseTimer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [taskSuccessModal?.visible, closeTaskSuccessModal]);

  if (!taskSuccessModal?.visible) return null;

  const task = taskSuccessModal.task;

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(closeTaskSuccessModal, 250);
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none select-none max-w-md mx-auto">
      <div
        onClick={handleDismiss}
        className={`w-full bg-white rounded-3xl p-4 border border-[#DEECFA] shadow-2xl shadow-blue-950/25 flex items-center justify-between pointer-events-auto cursor-pointer transition-all duration-300 ease-out transform ${
          isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-10 opacity-0 scale-95'
        }`}
      >
        {/* Left Side: Blue Verified Circle + Texts */}
        <div className="flex items-center space-x-3.5">
          {/* Blue Verified Circle */}
          <div className="w-13 h-13 rounded-full bg-[#1A73E8] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Check className="w-7 h-7 text-white stroke-[3.5]" />
          </div>

          {/* Texts */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <h4 className="text-[17px] font-black text-[#0F2445] tracking-tight leading-tight">
                Task Success
              </h4>
              <span className="text-blue-500 text-xs animate-pulse">✦</span>
            </div>
            
            <p className="text-xs font-semibold text-[#576E8E] mt-0.5 leading-snug">
              Your task has been completed
            </p>

            {/* Task Reward Pills */}
            {task && (
              <div className="flex items-center space-x-2 mt-1.5 flex-wrap">
                {Number(task.usdtReward) > 0 && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                    <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    <span>+{task.usdtReward} USDT</span>
                  </span>
                )}
                {Number(task.fgReward) > 0 && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black border border-amber-200">
                    <img src="/fn_coin.png" alt="Coin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    <span>+{task.fgReward} FN</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Small Close Pill */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1 shrink-0 ml-1"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
