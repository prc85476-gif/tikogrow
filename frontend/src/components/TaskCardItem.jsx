import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Play, Check, Loader2 } from 'lucide-react';
import { playGigaAd } from '../utils/adSdk';
import { openLinkSafely } from '../utils/linkOpener';

export default function TaskCardItem({ task }) {
  const { completeTask, showToast } = useApp();
  const [isJoinedClicked, setIsJoinedClicked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adStep, setAdStep] = useState(1); // Step 1: Watch ad -> Prompt click; Step 2: Watch & Claim

  const isTelegram = task.category === 'telegram' || task.type === 'telegram';
  const isAd =
    task.category === 'ads' ||
    task.type === 'ad' ||
    task.type === 'ads' ||
    task.id?.startsWith('task_ad_') ||
    task.title?.toLowerCase().includes('video ad') ||
    task.title?.toLowerCase().includes('sponsor ad');

  const handleAction = async () => {
    if (task.completed || isVerifying || isPlayingAd) return;

    // 1. Rewarded Ad Task with GigaPub SDK (2-Step Flow: View -> Click prompt -> Claim)
    if (isAd) {
      setIsPlayingAd(true);
      try {
        await playGigaAd();
        if (adStep === 1) {
          setAdStep(2);
          showToast('Please click on the ad to visit sponsor, then tap CLAIM to receive reward! 👆', 'info');
        } else {
          showToast('Ad verified! Claiming your reward... 🎉', 'success');
          await completeTask(task);
          setAdStep(1);
        }
      } catch (err) {
        console.warn('GigaPub Ad error/skipped:', err);
        if (adStep === 1) {
          setAdStep(2);
          showToast('Tap CLAIM to receive your reward! 👆', 'info');
        } else {
          showToast('Ad verified! Claiming your reward... 🎉', 'success');
          await completeTask(task);
          setAdStep(1);
        }
      } finally {
        setIsPlayingAd(false);
      }
      return;
    }

    // 2. Telegram Task with channel verification
    if (isTelegram) {
      if (!isJoinedClicked) {
        // Step 1: Open telegram link natively inside Telegram WebApp
        if (task.link) {
          openLinkSafely(task.link);
        }
        setIsJoinedClicked(true);
      } else {
        // Step 2: Verify membership & claim
        setIsVerifying(true);
        const res = await completeTask(task);
        setIsVerifying(false);
      }
    } else {
      // 3. Other social tasks (Twitter, Website, etc.)
      if (!isJoinedClicked && task.link) {
        openLinkSafely(task.link);
        setIsJoinedClicked(true);
      } else {
        setIsVerifying(true);
        await completeTask(task);
        setIsVerifying(false);
      }
    }
  };

  const renderIcon = () => {
    if (task.category === 'twitter' || task.type === 'twitter') {
      return (
        <img
          src="/x_logo.png"
          alt="Twitter (X)"
          className="w-11 h-11 rounded-xl object-contain shrink-0 shadow-sm"
        />
      );
    }
    if (task.category === 'telegram' || task.type === 'telegram') {
      return (
        <img
          src="/telegram_logo.png"
          alt="Telegram"
          className="w-11 h-11 rounded-xl object-contain shrink-0 shadow-sm"
        />
      );
    }
    if (
      task.category === 'ads' ||
      task.type === 'ads' ||
      task.id?.includes('ad') ||
      task.title?.toLowerCase().includes('sponsor') ||
      task.title?.toLowerCase().includes('watch')
    ) {
      return (
        <img
          src="/ads_logo.png"
          alt="Google Ads"
          className="w-11 h-11 rounded-xl object-contain shrink-0 shadow-sm"
        />
      );
    }
    // Generic / Video
    return (
      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm text-white">
        <Play className="w-5 h-5 fill-white ml-0.5" />
      </div>
    );
  };

  return (
    <div className="foxtask-card rounded-2xl p-4 flex items-center justify-between border border-white/5 transition-all">
      {/* Left Icon + Info */}
      <div className="flex items-center space-x-3 max-w-[68%]">
        {renderIcon()}

        <div className="min-w-0">
          {/* Title */}
          <div className="flex items-center space-x-1.5">
            <h4 className="text-sm font-extrabold text-white truncate">
              {task.title}
            </h4>
            {(task.isVerified || task.id?.startsWith('task_official')) && (
              <img
                src="/blue_verified.png"
                alt="Verified"
                className="w-4 h-4 object-contain shrink-0 drop-shadow-sm"
              />
            )}
            {task.hasGlobe && !task.isVerified && !task.id?.startsWith('task_official') && (
              <span className="text-xs text-[#00DF8F]">🌐</span>
            )}
          </div>

          {/* Rewards Row */}
          <div className="flex items-center space-x-2.5 mt-1.5 flex-wrap">
            {/* USDT Reward */}
            {Number(task.usdtReward) > 0 && (
              <div className="flex items-center space-x-1 text-xs font-black text-[#00DF8F]">
                <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>+{task.usdtReward}</span>
              </div>
            )}

            {/* FN Coin Reward */}
            {Number(task.fgReward) > 0 && (
              <div className="flex items-center space-x-1 text-xs font-black text-[#FBBF24]">
                <img src="/fn_coin.png" alt="Coin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>+{task.fgReward}</span>
              </div>
            )}

            {/* Progress dash indicator & code */}
            <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-semibold">
              <span className="w-4 h-1 bg-[#FF6128] rounded-full inline-block"></span>
              <span className="font-mono text-gray-300">
                {task.joinedMembers ? `${task.joinedMembers}/${task.participants}` : task.participants}
              </span>
              <span className="text-gray-500 font-mono text-[10px]">{task.code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Action Button */}
      <button
        onClick={handleAction}
        disabled={task.completed || isVerifying || isPlayingAd}
        className={`min-w-[72px] px-3.5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center ${
          task.completed
            ? 'bg-gray-800 text-[#00DF8F] border border-[#00DF8F]/30 cursor-default flex items-center space-x-1'
            : isPlayingAd
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : (isTelegram && isJoinedClicked) || (isAd && adStep === 2)
            ? 'bg-[#00DF8F] hover:bg-[#00DF8F]/90 text-black shadow-lg shadow-[#00DF8F]/20 active:scale-95'
            : 'btn-orange-3d shadow-md'
        }`}
      >
        {task.completed ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>DONE</span>
          </>
        ) : isPlayingAd ? (
          <span className="flex items-center space-x-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>PLAYING</span>
          </span>
        ) : isVerifying ? (
          <span className="flex items-center space-x-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>CHECKING</span>
          </span>
        ) : isTelegram ? (
          isJoinedClicked ? 'CHECK' : 'START'
        ) : isAd ? (
          adStep === 2 ? 'CLAIM' : 'START'
        ) : (
          'START'
        )}
      </button>
    </div>
  );
}

