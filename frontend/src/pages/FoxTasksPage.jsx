import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TaskCardItem from '../components/TaskCardItem';
import { Search, RotateCw, CheckCircle2, Clock, Sparkles, Check } from 'lucide-react';

export default function FoxTasksPage() {
  const {
    user,
    tasks,
    fetchTasks,
    advanceTasks,
    fetchAdvanceTasks,
    setActiveAdvanceModalTask,
    currentWithdrawAlert,
    selectedCategory,
    setSelectedCategory
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adsTimeLeft, setAdsTimeLeft] = useState('');

  // Live ticking countdown for 24-hour Ads cooldown
  useEffect(() => {
    const calculateCountdown = () => {
      const COOLDOWN_24H = 24 * 60 * 60 * 1000;
      const baseTime = user?.allAdsCompletedAt ? Number(user.allAdsCompletedAt) : null;
      if (!baseTime) {
        setAdsTimeLeft('24:00:00');
        return;
      }
      const diff = (baseTime + COOLDOWN_24H) - Date.now();
      if (diff <= 0) {
        setAdsTimeLeft('00:00:00');
        if (fetchTasks) fetchTasks();
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setAdsTimeLeft(formatted);
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [user?.allAdsCompletedAt, fetchTasks]);

  useEffect(() => {
    if (fetchTasks) fetchTasks();
    if (fetchAdvanceTasks) fetchAdvanceTasks();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchTasks ? fetchTasks() : Promise.resolve(),
        fetchAdvanceTasks ? fetchAdvanceTasks() : Promise.resolve()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterCategories = [
    { id: 'ALL', label: 'ALL', icon: null },
    { id: 'telegram', label: 'TELEGRAM', icon: <img src="/telegram_logo.png" alt="TG" className="w-3.5 h-3.5 rounded-sm inline mr-1 object-contain" /> },
    { id: 'twitter', label: 'TWITTER', icon: <img src="/x_logo.png" alt="X" className="w-3.5 h-3.5 rounded-sm inline mr-1 object-contain" /> },
    { id: 'tiktok', label: 'TIKTOK', icon: <span className="font-sans text-xs mr-1">♪</span> },
    { id: 'ads', label: 'ADS', icon: <img src="/ads_logo.png" alt="ADS" className="w-3.5 h-3.5 rounded-sm inline mr-1 object-contain" /> },
    { id: 'advance', label: '⚡ ADVANCE', icon: <span className="mr-1 text-amber-400">⚡</span> }
  ];

  const isAdvanceCategory = selectedCategory === 'advance';

  const filteredTasks = tasks.filter((task) => {
    if (isAdvanceCategory) return false;
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (task.category || '').toLowerCase() === selectedCategory.toLowerCase() ||
      (task.type || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredAdvanceTasks = (advanceTasks || []).filter((task) => {
    if (!isAdvanceCategory) return false;
    // Exclude approved advance tasks
    if (task.userSubmission?.status === 'approved') return false;
    const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="pt-2 px-4 pb-28 select-none space-y-3">
      {/* App Bar title */}
      <div className="flex items-center justify-between text-gray-300 text-sm">
        <span className="font-extrabold text-white text-base tracking-tight flex items-center space-x-1">
          <span className="text-[#FF6128]">Tiko</span>
          <span>Grow</span>
        </span>
        <div className="text-gray-400">⋮</div>
      </div>

      {/* Top Live Withdraw Alert (Screenshot 3 style) */}
      <div className="flex items-center justify-center pt-1 text-xs font-bold text-gray-300">
        <div className="inline-flex items-center space-x-1.5 bg-[#12151D] border border-white/5 rounded-full px-3 py-1 shadow-inner">
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
              'T***1 JUST WITHDREW 1.914 USDT'
            )}
          </span>
        </div>
      </div>

      {/* Search Bar + Orange Search Square Button */}
      <div className="flex items-center space-x-2 pt-1">
        <div className="flex-1 flex items-center bg-[#12151D] border border-white/5 rounded-2xl px-3.5 py-3 focus-within:border-[#FF6128]/50 transition-colors">
          <Search className="w-4 h-4 text-gray-500 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-sm font-semibold text-white outline-none w-full placeholder:text-gray-500"
          />
        </div>

        {/* Orange Search Action Button */}
        <button className="w-12 h-12 rounded-2xl bg-[#FF6128] hover:bg-[#FF733E] flex items-center justify-center text-white shadow-md shadow-[#FF6128]/30 shrink-0 cursor-pointer transition-transform active:scale-95">
          <Search className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Horizontal Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
        {filterCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer flex items-center ${
                isActive
                  ? 'bg-[#FF6128] text-white shadow-md shadow-[#FF6128]/30'
                  : 'foxtask-card text-gray-300 hover:text-white border border-white/5'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Refresh Button on right */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="w-9 h-9 rounded-2xl foxtask-card flex items-center justify-center text-gray-400 hover:text-white shrink-0 cursor-pointer disabled:opacity-50"
          title="Refresh All Tasks from Database"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF6128]' : ''}`} />
        </button>
      </div>

      {/* 1. If ADVANCE filter is selected: Render Advance Tasks Section ONLY */}
      {isAdvanceCategory ? (
        <div className="space-y-3 pt-1">
          {/* Advance Tasks Hero Banner */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1C1A22] via-[#151922] to-[#10131A] border border-amber-500/25 shadow-xl relative overflow-hidden space-y-3.5">
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                  <Sparkles className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>High-Reward Bounty</span>
                </div>
                <h3 className="text-base font-black text-white pt-1">Advance Tasks</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                  Complete mission instructions, submit screenshot proof, and earn high USDT payouts upon admin approval.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6128]/20 to-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6 fill-amber-400" />
              </div>
            </div>

            {/* Feature chips */}
            <div className="flex items-center space-x-2 pt-2 border-t border-white/5 text-[11px] text-gray-300 font-semibold overflow-x-auto no-scrollbar">
              <span className="flex items-center space-x-1 shrink-0 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <span>📸</span>
                <span>Screenshot Proof</span>
              </span>
              <span className="flex items-center space-x-1 shrink-0 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <span>⚡</span>
                <span>Admin Approved</span>
              </span>
              <span className="flex items-center space-x-1 shrink-0 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <span>💰</span>
                <span className="text-[#00DF8F]">High USDT Rewards</span>
              </span>
            </div>
          </div>

          {/* Advance Task List or Empty State */}
          {filteredAdvanceTasks.length === 0 ? (
            <div className="foxtask-card rounded-3xl p-8 text-center border border-white/5 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                <Sparkles className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">No Advance Tasks Available</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  New high-reward advance tasks will be posted soon. Please check back later!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAdvanceTasks.map((adv) => {
                const sub = adv.userSubmission;
                const isApproved = sub?.status === 'approved';
                const isPending = sub?.status === 'pending';
                const isRejected = sub?.status === 'rejected';

                return (
                  <div
                    key={adv.id}
                    onClick={() => setActiveAdvanceModalTask(adv)}
                    className="foxtask-card rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer shadow-md bg-[#161B26]"
                  >
                    {/* Left Icon + Info */}
                    <div className="flex items-center space-x-3.5 max-w-[68%]">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E1B18] to-[#2B2315] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm text-amber-400">
                        <Sparkles className="w-6 h-6 fill-amber-400 stroke-amber-400" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono tracking-wider shrink-0">
                            ⚡ ADVANCE
                          </span>
                          <h4 className="text-sm font-extrabold text-white truncate">{adv.title}</h4>
                          {adv.isVerified && (
                            <img src="/blue_verified.png" alt="Verified" className="w-4 h-4 object-contain shrink-0 drop-shadow-sm" />
                          )}
                        </div>

                        <div className="flex items-center space-x-2.5 mt-1.5 flex-wrap">
                          <div className="flex items-center space-x-1 text-xs font-black text-[#00DF8F]">
                            <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                            <span>+${Number(adv.usdtReward || 0).toFixed(3)}</span>
                          </div>
                          {Number(adv.fgReward) > 0 && (
                            <div className="flex items-center space-x-1 text-xs font-black text-[#FBBF24]">
                              <img src="/fn_coin.png" alt="Coin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                              <span>+{adv.fgReward}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-semibold">
                            <span className="w-4 h-1 bg-[#FF6128] rounded-full inline-block"></span>
                            <span className="font-mono text-gray-300">
                              {adv.completedCount || 0}/{adv.participants || 100}
                            </span>
                            <span className="text-gray-500 font-mono text-[10px]">{adv.code || '#ADV'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAdvanceModalTask(adv);
                      }}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all ${
                        isApproved
                          ? 'bg-gray-800 text-[#00DF8F] border border-[#00DF8F]/30 flex items-center space-x-1 cursor-default'
                          : isPending
                          ? 'bg-[#181D2A] text-amber-400 border border-amber-500/40 flex items-center space-x-1.5 shadow-sm'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1'
                          : 'btn-orange-3d text-white shadow-md shadow-[#FF6128]/25 hover:brightness-110 active:scale-95'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>DONE</span>
                        </>
                      ) : isPending ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                          <span>REVIEW</span>
                        </>
                      ) : isRejected ? (
                        <span>RESUBMIT</span>
                      ) : (
                        <span>START</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2. For standard categories (ALL, TELEGRAM, TWITTER, TIKTOK, ADS): ONLY show standard tasks */
        <div className="space-y-2.5 pt-1">
          {filteredTasks.length === 0 ? (
            selectedCategory === 'ads' ? (
              <div className="foxtask-card rounded-3xl p-7 text-center border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-[#12151D] to-[#12151D] space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-[#00DF8F]/15 border border-[#00DF8F]/30 flex items-center justify-center text-[#00DF8F] mx-auto shadow-lg shadow-[#00DF8F]/10">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">All Daily Ads Completed! 🎉</h4>
                  <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    You have watched all available video ads. Fresh ads unlock automatically every 24 hours. The Telegram bot will notify you when ads are back!
                  </p>
                </div>

                <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 max-w-xs mx-auto space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center justify-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Next Ads Reset In</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                    {adsTimeLeft || '24:00:00'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    24-Hour Cooldown Active • Auto-notification on Bot
                  </div>
                </div>
              </div>
            ) : (
              <div className="foxtask-card rounded-3xl p-8 text-center border border-white/5 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FF6128]/10 border border-[#FF6128]/20 flex items-center justify-center text-[#FF6128] mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">No Tasks Available</h4>
                  <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    {searchQuery
                      ? 'No tasks match your search query.'
                      : "You've completed all available tasks! New tasks will appear here as soon as they are published."}
                  </p>
                </div>
              </div>
            )
          ) : (
            filteredTasks.map((task) => (
              <TaskCardItem key={task.id} task={task} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
