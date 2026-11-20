import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  PlusCircle,
  Globe,
  Sparkles,
  Send,
  Check,
  Users,
  Calculator,
  Wallet,
  Plus,
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  BarChart3,
  Radio,
  UserPlus,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  X,
  Copy,
  CheckCheck,
  Bot,
  RefreshCw,
  Info
} from 'lucide-react';

export default function AddTaskPage() {
  const { setActiveTab, createTask, approveTask, verifyChannelAdmin, showToast, user, tasks, config } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('create'); // 'create' | 'my-campaigns'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('telegram');
  const [link, setLink] = useState('');
  const [rewardCurrency, setRewardCurrency] = useState('USDT'); // 'USDT' | 'FN'
  const [participants, setParticipants] = useState('100'); // Minimum 100 members default
  const [usdtReward, setUsdtReward] = useState('0.005'); // Minimum 0.005 USDT/user ($0.50 for 100)
  const [fnReward, setFnReward] = useState('5'); // Minimum 5 FN/user (500 FN for 100)
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Telegram Bot Admin Verification Modal State
  const [showBotAdminModal, setShowBotAdminModal] = useState(false);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [botAdminError, setBotAdminError] = useState('');
  const [copiedBot, setCopiedBot] = useState(false);

  const botUsername = config?.botUsername || 'TikoGrowbot';

  // Typewriter animation state for hero box
  const FULL_TITLE = "Create & Promote Task";
  const FULL_DESC = "Publish your task to thousands of active members. Rewards are automatically settled in USDT & FN Coins.";

  const [typedTitle, setTypedTitle] = useState('');
  const [typedDesc, setTypedDesc] = useState('');
  const [isTypingTitle, setIsTypingTitle] = useState(true);
  const [isTypingDesc, setIsTypingDesc] = useState(false);

  useEffect(() => {
    let titleIdx = 0;
    let descIdx = 0;
    let descInterval = null;

    setTypedTitle('');
    setTypedDesc('');
    setIsTypingTitle(true);
    setIsTypingDesc(false);

    // 1. Type Title
    const titleInterval = setInterval(() => {
      if (titleIdx < FULL_TITLE.length) {
        setTypedTitle(FULL_TITLE.slice(0, titleIdx + 1));
        titleIdx++;
      } else {
        clearInterval(titleInterval);
        setIsTypingTitle(false);
        setIsTypingDesc(true);

        // 2. Type Description right after title finishes
        descInterval = setInterval(() => {
          if (descIdx < FULL_DESC.length) {
            setTypedDesc(FULL_DESC.slice(0, descIdx + 1));
            descIdx++;
          } else {
            clearInterval(descInterval);
            setIsTypingDesc(false);
          }
        }, 16);
      }
    }, 30);

    return () => {
      clearInterval(titleInterval);
      if (descInterval) clearInterval(descInterval);
    };
  }, [activeSubTab]);

  // Filter creator's campaigns
  const createdIds = (() => {
    try {
      return JSON.parse(localStorage.getItem('foxtask_my_campaign_ids') || '[]');
    } catch {
      return [];
    }
  })();

  const myCampaigns = (tasks || []).filter((t) => {
    if (t.creatorId && user?.id && String(t.creatorId) === String(user.id)) return true;
    if (t.creatorId === 'guest_user') return true;
    if (createdIds.includes(t.id)) return true;
    return false;
  });

  const totalJoinedAcrossAll = myCampaigns.reduce((acc, c) => acc + (c.joinedMembers || 0), 0);
  const totalTargetAcrossAll = myCampaigns.reduce((acc, c) => acc + (Number(c.participants) || 100), 0);

  const numMembers = Math.max(100, Number(participants) || 100);
  const numUsdt = Math.max(0.005, Number(usdtReward) || 0.005);
  const numFn = Math.max(5, Number(fnReward) || 5);
  const totalUsdtPaid = (numMembers * numUsdt).toFixed(2);
  const totalFnPaid = Math.round(numMembers * numFn).toLocaleString();
  const totalFnAsUsdt = ((numMembers * numFn) * 0.001).toFixed(2);

  // Balances: Topup Balance + Home Earned Balance can both fund tasks
  const depositBal = Number(user?.depositBalance || 0);
  const earnBal = Number(user?.usdtBalance || 0);
  const totalAvailableToSpend = Number((depositBal + earnBal).toFixed(4));
  const currentCostUsdt = rewardCurrency === 'USDT' ? Number(totalUsdtPaid) : Number(totalFnAsUsdt);
  const hasEnoughFunds = totalAvailableToSpend >= currentCostUsdt;

  const handleCurrencyChange = (curr) => {
    setRewardCurrency(curr);
    if (curr === 'FN') {
      const converted = Math.max(5, Math.round((Number(usdtReward) || 0.005) / 0.001));
      setFnReward(String(converted));
    } else {
      const converted = Math.max(0.005, Number(((Number(fnReward) || 5) * 0.001).toFixed(4)));
      setUsdtReward(String(converted));
    }
  };

  const categories = [
    { id: 'telegram', label: 'Telegram', iconImg: '/telegram_logo.png' },
    { id: 'twitter', label: 'Twitter (X)', iconImg: '/x_logo.png' },
    { id: 'ads', label: 'Google Ads', iconImg: '/ads_logo.png' },
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
    { id: 'website', label: 'Website', icon: '🌐' }
  ];

  // Core task creation logic
  const proceedCreateTask = async () => {
    setSubmitting(true);
    try {
      const isUsdt = rewardCurrency === 'USDT';
      const created = await createTask({
        title: title.trim(),
        category,
        link: link.trim(),
        usdtReward: isUsdt ? (Number(usdtReward) || 0.005) : 0,
        fgReward: isUsdt ? 0 : (Number(fnReward) || 5),
        participants: Number(participants),
        description: description.trim(),
        hasGlobe: true
      });

      if (created) {
        showToast('Campaign Submitted! Awaiting Admin Approval.', 'success');
        // Reset form
        setTitle('');
        setLink('');
        setDescription('');
        setShowBotAdminModal(false);
        // Automatically switch to My Campaigns to see pending status
        setTimeout(() => {
          setActiveSubTab('my-campaigns');
        }, 500);
      }
    } catch {
      showToast('Failed to create task campaign', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }
    if (!link.trim() || (!link.startsWith('http://') && !link.startsWith('https://'))) {
      showToast('Please enter a valid link starting with https://', 'error');
      return;
    }

    const memberCount = Number(participants);
    if (isNaN(memberCount) || memberCount < 100) {
      showToast('Minimum 100 members required for a campaign', 'error');
      return;
    }

    const isUsdt = rewardCurrency === 'USDT';
    if (isUsdt && Number(usdtReward) < 0.005) {
      showToast('Minimum reward is 0.005 USDT per user', 'error');
      return;
    }
    if (!isUsdt && Number(fnReward) < 5) {
      showToast('Minimum reward is 5 FN Coins per user', 'error');
      return;
    }

    // Check total available balance (Topup + Earned)
    if (!hasEnoughFunds) {
      showToast(
        `Insufficient balance! Required: $${currentCostUsdt.toFixed(2)} USDT, Available: $${totalAvailableToSpend.toFixed(2)} USDT (Topup: $${depositBal.toFixed(2)} + Earned: $${earnBal.toFixed(2)}). Please deposit to publish.`,
        'error'
      );
      setTimeout(() => {
        setActiveTab('deposit');
      }, 900);
      return;
    }

    // If Telegram campaign: Open Admin Bot Verification Popup
    if (category === 'telegram') {
      setBotAdminError('');
      setShowBotAdminModal(true);
      return;
    }

    // Non-telegram tasks can proceed directly
    await proceedCreateTask();
  };

  // Verify Bot Admin & Proceed Submit
  const handleVerifyAndSubmit = async () => {
    setVerifyingAdmin(true);
    setBotAdminError('');

    const res = await verifyChannelAdmin(link);
    setVerifyingAdmin(false);

    if (res.success) {
      showToast('Bot Verified as Administrator!', 'success');
      await proceedCreateTask();
    } else {
      setBotAdminError(
        res.error ||
          `Please make sure you have added @${botUsername} as an Administrator in your channel/group with Invite permissions.`
      );
      showToast('Bot Admin verification failed', 'error');
    }
  };

  const handleCopyBot = () => {
    navigator.clipboard?.writeText(`@${botUsername}`);
    setCopiedBot(true);
    showToast(`Copied @${botUsername} to clipboard!`, 'info');
    setTimeout(() => setCopiedBot(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white pb-28 pt-2 px-4 select-none">
      {/* Top Header Row with Back Button & Deposit Balance */}
      <div className="flex items-center justify-between py-2 border-b border-white/5 mb-3">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#12141A] border border-white/10 flex items-center justify-center text-white shadow-sm hover:border-[#FF6128]/50">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">Back</span>
        </button>

        <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
          <PlusCircle className="w-4 h-4 text-[#FF6128]" />
          <span>Campaign Hub</span>
        </div>

        {/* Top-Right Balance Pill (Topup Only) & Topup Button */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="flex items-center space-x-1 bg-[#12141A] border border-white/10 py-1 px-2.5 rounded-xl text-[11px]">
            <span className="text-[10px] uppercase font-black text-gray-400">Topup:</span>
            <span className="font-mono font-black text-[#00DF8F]">${depositBal.toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className="flex items-center space-x-1 bg-[#FF6128] hover:bg-[#FF7533] text-white py-1 px-2 rounded-xl text-xs font-black shadow-md cursor-pointer shrink-0 transition-transform active:scale-95"
            title="Topup Balance for Campaigns"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Topup</span>
          </button>
        </div>
      </div>

      {/* Top Sub-Tab Navigation Bar: [ + Create Task ] and [ My Campaigns ] */}
      <div className="grid grid-cols-2 p-1 bg-[#12141A] border border-white/10 rounded-2xl mb-4 gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('create')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeSubTab === 'create'
              ? 'bg-[#FF6128] text-white shadow-md shadow-[#FF6128]/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Create Task</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('my-campaigns')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative ${
            activeSubTab === 'my-campaigns'
              ? 'bg-[#FF6128] text-white shadow-md shadow-[#FF6128]/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>My Campaigns</span>
          {myCampaigns.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                activeSubTab === 'my-campaigns'
                  ? 'bg-black/35 text-white'
                  : 'bg-[#FF6128]/20 text-[#FF6128]'
              }`}
            >
              {myCampaigns.length}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CREATE TASK CAMPAIGN */}
      {/* ============================================================== */}
      {activeSubTab === 'create' && (
        <>
          {/* Hero Banner with Futuristic Grid Line Pattern */}
          <div className="rounded-3xl p-5 mb-5 relative overflow-hidden border border-[#FF6128]/30 bg-gradient-to-br from-[#11141D] via-[#0E1017] to-[#18110D] shadow-xl shadow-black/60">
            {/* Crisp Tech Grid Lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                  linear-gradient(to right, rgba(255, 97, 40, 0.18) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 97, 40, 0.18) 1px, transparent 1px)
                `,
                backgroundSize: '18px 18px, 18px 18px, 72px 72px, 72px 72px',
                maskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, black 60%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, black 60%, transparent 100%)'
              }}
            />

            {/* Ambient Glow Orbs */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#FF6128]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#2AABEE]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Content with Smooth Cyber Typewriter Effect */}
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#FF6128] mb-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6128] drop-shadow-[0_0_6px_rgba(255,97,40,0.6)] animate-pulse" />
                <span className="tracking-wider uppercase text-[11px] font-black">Sponsor Engagement Hub</span>
              </div>

              {/* Typing Title */}
              <h2 className="text-xl font-black text-white tracking-tight drop-shadow-sm min-h-[28px] flex items-center">
                <span>{typedTitle}</span>
                {isTypingTitle && (
                  <span className="inline-block w-1.5 h-4.5 bg-[#FF6128] ml-1 animate-pulse rounded-sm shadow-[0_0_8px_#FF6128]" />
                )}
              </h2>

              {/* Typing Description */}
              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-normal min-h-[36px]">
                <span>{typedDesc}</span>
                {isTypingDesc && (
                  <span className="inline-block w-1 h-3.5 bg-[#FF6128] ml-0.5 animate-pulse rounded-sm shadow-[0_0_6px_#FF6128]" />
                )}
              </p>
            </div>
          </div>

          {/* Task Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Category Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Select Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                      category === cat.id
                        ? 'bg-[#FF6128] text-white border-[#FF6128] shadow-md shadow-[#FF6128]/25 scale-[1.02]'
                        : 'foxtask-card text-gray-300 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {cat.iconImg ? (
                      <img src={cat.iconImg} alt={cat.label} className="w-4 h-4 rounded-md object-contain shrink-0" />
                    ) : (
                      <span>{cat.icon}</span>
                    )}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Task Title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Task Title
              </label>
              <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#FF6128] transition-colors">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Join Official Telegram Channel"
                  className="bg-transparent text-sm font-semibold text-white w-full outline-none placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            {/* 3. Task Link / URL */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Target Link (URL)
              </label>
              <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#FF6128] transition-colors flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://t.me/your_channel_or_link"
                  className="bg-transparent text-sm font-mono text-white w-full outline-none placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            {/* 4. Reward Currency Selector (NO GLOW / CLEAN FLAT BORDERS) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Reward Currency
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* USDT Button - Crisp clean border without shadow blur */}
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USDT')}
                  className={`py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 font-black text-sm transition-all cursor-pointer border-2 ${
                    rewardCurrency === 'USDT'
                      ? 'bg-[#00DF8F]/15 border-[#00DF8F] text-[#00DF8F]'
                      : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <img src="/usdt.png" alt="USDT" className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <span>USDT</span>
                  {rewardCurrency === 'USDT' && <Check className="w-4 h-4 ml-1 stroke-[3]" />}
                </button>

                {/* FN Coin Button - Crisp clean border without shadow blur */}
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('FN')}
                  className={`py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 font-black text-sm transition-all cursor-pointer border-2 ${
                    rewardCurrency === 'FN'
                      ? 'bg-[#FBBF24]/15 border-[#FBBF24] text-[#FBBF24]'
                      : 'bg-[#12141A] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <img src="/fn_coin.png" alt="FN Coin" className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <span>FN Coin</span>
                  {rewardCurrency === 'FN' && <Check className="w-4 h-4 ml-1 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* 5. Target Members (Minimum 100 Enforced) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
                  Target Members <span className="text-gray-500 font-normal lowercase">(min. 100)</span>
                </label>
                <span className="text-xs font-black text-[#FF6128] font-mono">
                  {numMembers.toLocaleString()} Members
                </span>
              </div>
              <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#FF6128] transition-colors flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="number"
                  min="100"
                  step="1"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="bg-transparent text-base font-black text-white w-full outline-none font-mono"
                  placeholder="Min. 100 members"
                  required
                />
                <span className="text-xs font-bold text-gray-500 shrink-0">Users</span>
              </div>

              {/* Clean Shortcuts starting at minimum 100 */}
              <div className="flex items-center space-x-2 mt-2">
                {[
                  { label: '100', val: '100', costUsdt: '$0.50', costFn: '500 FN' },
                  { label: '250', val: '250', costUsdt: '$1.25', costFn: '1.25K FN' },
                  { label: '500', val: '500', costUsdt: '$2.50', costFn: '2.5K FN' },
                  { label: '1K', val: '1000', costUsdt: '$5.00', costFn: '5K FN' },
                  { label: '5K', val: '5000', costUsdt: '$25.00', costFn: '25K FN' }
                ].map((chip) => (
                  <button
                    type="button"
                    key={chip.val}
                    onClick={() => setParticipants(chip.val)}
                    className={`flex-1 py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center ${
                      participants === chip.val
                        ? 'bg-[#FF6128] border-[#FF6128] text-white shadow-md shadow-[#FF6128]/25 scale-105'
                        : 'bg-[#12141A] border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-black">{chip.label}</span>
                    <span className={`text-[10px] font-bold font-mono ${participants === chip.val ? 'text-white/90' : 'text-gray-400'}`}>
                      {rewardCurrency === 'USDT' ? chip.costUsdt : chip.costFn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Reward per User (Minimum 0.005 USDT / 5 FN) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
                  Reward per User ({rewardCurrency})
                </label>
                <span className="text-[11px] text-[#FF6128] font-bold font-mono">
                  {rewardCurrency === 'USDT'
                    ? 'Min: $0.005 / user'
                    : 'Min: 5 FN / user'}
                </span>
              </div>

              {rewardCurrency === 'USDT' ? (
                <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3.5 flex items-center space-x-2.5 focus-within:border-[#00DF8F] transition-colors">
                  <img src="/usdt.png" alt="USDT" className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <input
                    type="number"
                    step="0.001"
                    min="0.005"
                    value={usdtReward}
                    onChange={(e) => setUsdtReward(e.target.value)}
                    className="bg-transparent text-lg font-black text-[#00DF8F] w-full outline-none font-mono"
                    required
                  />
                  <span className="text-xs font-bold text-gray-400 shrink-0">USDT / User</span>
                </div>
              ) : (
                <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3.5 flex items-center space-x-2.5 focus-within:border-[#FBBF24] transition-colors">
                  <img src="/fn_coin.png" alt="FN Coin" className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <input
                    type="number"
                    step="1"
                    min="5"
                    value={fnReward}
                    onChange={(e) => setFnReward(e.target.value)}
                    className="bg-transparent text-lg font-black text-[#FBBF24] w-full outline-none font-mono"
                    required
                  />
                  <span className="text-xs font-bold text-gray-400 shrink-0">FN / User</span>
                </div>
              )}
            </div>

            {/* 7. Total Paid Amount Summary & Dedicated Deposit Wallet Check */}
            <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg shadow-black/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center space-x-1.5 text-white">
                  <Calculator className="w-4 h-4 text-[#FF6128]" />
                  <span>Total Paid Amount</span>
                </div>
                <span className="text-[11px] font-mono text-gray-500">
                  {rewardCurrency === 'USDT'
                    ? `${numMembers.toLocaleString()} × $${numUsdt.toFixed(3)}`
                    : `${numMembers.toLocaleString()} × ${numFn} FN`}
                </span>
              </div>

              <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    {rewardCurrency === 'USDT' ? 'Total USDT Cost' : 'Total FN Coins'}
                  </span>
                  <div
                    className={`text-2xl font-black font-mono mt-0.5 tracking-tight ${
                      rewardCurrency === 'USDT' ? 'text-[#00DF8F]' : 'text-[#FBBF24]'
                    }`}
                  >
                    {rewardCurrency === 'USDT' ? `$${totalUsdtPaid} USDT` : `${totalFnPaid} FN`}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Per User
                  </span>
                  <span
                    className={`text-sm font-black font-mono ${
                      rewardCurrency === 'USDT' ? 'text-[#00DF8F]' : 'text-[#FBBF24]'
                    }`}
                  >
                    {rewardCurrency === 'USDT' ? `+${usdtReward} USDT` : `+${fnReward} FN`}
                  </span>
                  {rewardCurrency === 'FN' && (
                    <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                      ≈ ${totalFnAsUsdt} USDT
                    </span>
                  )}
                </div>
              </div>

              {/* Dedicated Topup & Earned Balance Breakdown */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-gray-300">
                    <Wallet className="w-4 h-4 text-[#00DF8F]" />
                    <span className="font-bold">Topup Balance:</span>
                    <span className="font-mono font-black text-[#00DF8F]">
                      ${depositBal.toFixed(2)} USDT
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('deposit')}
                    className="px-2 py-0.5 rounded-lg bg-[#00DF8F]/15 hover:bg-[#00DF8F] text-[#00DF8F] hover:text-black text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Topup</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-gray-300">
                    <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                    <span className="font-bold">Home Earned Balance:</span>
                    <span className="font-mono font-black text-[#FBBF24]">
                      ${earnBal.toFixed(2)} USDT
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Usable</span>
                </div>

                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between text-xs border border-white/5">
                  <span className="font-black text-gray-200">Total Available to Publish:</span>
                  <span className={`font-mono font-black ${hasEnoughFunds ? 'text-[#00DF8F]' : 'text-red-400'}`}>
                    ${totalAvailableToSpend.toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {/* Low Balance Warning Alert */}
              {!hasEnoughFunds && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    You need <strong>${currentCostUsdt.toFixed(2)} USDT</strong>. You can fund this task with your Topup Balance and Earned Balance.
                  </span>
                </div>
              )}
            </div>

            {/* 8. Description / Notes */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Task Instructions (Optional)
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Join the official channel and stay active to claim verified rewards."
                className="w-full bg-[#12141A] border border-white/10 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-[#FF6128] placeholder:text-gray-500 resize-none font-medium"
              />
            </div>

            {/* 9. Live Preview Card */}
            <div className="pt-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                Live Preview
              </label>
              <div className="foxtask-card rounded-2xl p-4 flex items-center justify-between border border-[#FF6128]/30 bg-[#FF6128]/5">
                <div className="flex items-center space-x-3 max-w-[68%]">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {category === 'twitter' ? (
                      <img src="/x_logo.png" alt="Twitter" className="w-11 h-11 rounded-xl object-contain" />
                    ) : category === 'telegram' ? (
                      <img src="/telegram_logo.png" alt="Telegram" className="w-11 h-11 rounded-xl object-contain" />
                    ) : category === 'ads' ? (
                      <img src="/ads_logo.png" alt="Google Ads" className="w-11 h-11 rounded-xl object-contain" />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xl">
                          {categories.find((c) => c.id === category)?.icon || '✈️'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-white truncate">
                      {title.trim() || 'Your Task Title'}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {rewardCurrency === 'USDT' ? (
                        <div className="flex items-center space-x-1 text-xs font-black text-[#00DF8F]">
                          <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                          <span>+{usdtReward || '0.005'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs font-black text-[#FBBF24]">
                          <img src="/fn_coin.png" alt="FN Coin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                          <span>+{fnReward || '5'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl text-xs font-black uppercase bg-[#FF6128] text-white shadow-md">
                  START
                </div>
              </div>
            </div>

            {/* Submit & Publish Button (Deducts from Available Balances) */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-2xl text-white text-base font-black flex items-center justify-center space-x-2 shadow-xl cursor-pointer active:scale-95 transition-all ${
                  !hasEnoughFunds
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-red-500/40 text-gray-300'
                    : 'btn-hero-orange shadow-[#FF6128]/30'
                }`}
              >
                <Send className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {submitting
                    ? 'Submitting for Approval...'
                    : !hasEnoughFunds
                    ? `Topup Balance to Publish ($${currentCostUsdt.toFixed(2)})`
                    : category === 'telegram'
                    ? `Continue & Verify Bot Admin ($${currentCostUsdt.toFixed(2)})`
                    : `Submit Task (-$${currentCostUsdt.toFixed(2)})`}
                </span>
              </button>
            </div>
          </form>
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY CAMPAIGNS (TRACK JOINED MEMBERS LIVE & PENDING STATUS) */}
      {/* ============================================================== */}
      {activeSubTab === 'my-campaigns' && (
        <div className="space-y-4">
          {/* Overview Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Campaigns
              </span>
              <span className="text-lg font-black text-white font-mono mt-0.5 block">
                {myCampaigns.length}
              </span>
            </div>

            <div className="bg-[#12141A] border border-[#00DF8F]/20 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Total Joined
              </span>
              <span className="text-lg font-black text-[#00DF8F] font-mono mt-0.5 block">
                {totalJoinedAcrossAll}
              </span>
            </div>

            <div className="bg-[#12141A] border border-white/10 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Deposit Balance
              </span>
              <span className="text-lg font-black text-[#00DF8F] font-mono mt-0.5 block">
                ${depositBal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Campaigns List */}
          {myCampaigns.length === 0 ? (
            <div className="bg-[#12141A] border border-white/10 rounded-3xl p-8 text-center my-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6128]/10 border border-[#FF6128]/30 flex items-center justify-center mx-auto mb-3 text-[#FF6128]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-white">No Campaigns Created Yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Publish a campaign to promote your Telegram channel, group, X account, or website to thousands of real users.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('create')}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-[#FF6128] hover:bg-[#ff723f] text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-[#FF6128]/25 transition-all"
              >
                + Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Your Campaigns ({myCampaigns.length})
                </span>
                <span className="text-[11px] text-[#00DF8F] font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-ping inline-block" />
                  <span>Realtime Status</span>
                </span>
              </div>

              {myCampaigns.map((camp) => {
                const joined = camp.joinedMembers || 0;
                const target = Math.max(1, Number(camp.participants) || 100);
                const percent = Math.min(100, Math.round((joined / target) * 100));
                const isCompleted = joined >= target;
                const isPending = camp.status === 'pending';
                const isRejected = camp.status === 'rejected';

                return (
                  <div
                    key={camp.id}
                    className="bg-[#12141A] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden"
                  >
                    {/* Top row: Platform, Title, Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 max-w-[65%]">
                        <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {camp.category === 'twitter' || camp.type === 'twitter' ? (
                            <img src="/x_logo.png" alt="Twitter" className="w-7 h-7 object-contain" />
                          ) : camp.category === 'telegram' || camp.type === 'telegram' ? (
                            <img src="/telegram_logo.png" alt="Telegram" className="w-7 h-7 object-contain" />
                          ) : camp.category === 'ads' || camp.type === 'ads' ? (
                            <img src="/ads_logo.png" alt="Google Ads" className="w-7 h-7 object-contain" />
                          ) : (
                            <Globe className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white truncate">
                            {camp.title}
                          </h4>
                          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
                            {camp.category || 'Telegram'} • ID: {camp.code || camp.id.slice(-6)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isPending ? (
                        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>Pending Approval</span>
                        </div>
                      ) : isRejected ? (
                        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider">
                          <span>Rejected</span>
                        </div>
                      ) : isCompleted ? (
                        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#00DF8F]/15 border border-[#00DF8F]/40 text-[#00DF8F] text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Finished</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#00DF8F]/15 border border-[#00DF8F]/40 text-[#00DF8F] text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00DF8F] animate-pulse" />
                          <span>Live & Public</span>
                        </div>
                      )}
                    </div>

                    {/* Pending Approval Explainer Banner & Test Approval */}
                    {isPending && (
                      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-300">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-[11px] leading-tight">
                            Under Admin Review. Once approved, it will be published to all users.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => approveTask(camp.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-sm ml-2 active:scale-95"
                          title="Simulate Admin Approval for Testing"
                        >
                          Approve (Admin)
                        </button>
                      </div>
                    )}

                    {/* Live Progress Bar Section */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-400 flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-[#FF6128]" />
                          <span>Users Joined:</span>
                        </span>
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="text-sm font-black text-white">
                            {joined.toLocaleString()}
                          </span>
                          <span className="text-gray-500 font-bold">/</span>
                          <span className="text-xs text-gray-400 font-bold">
                            {target.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-[#00DF8F] ml-1">
                            ({percent}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress Track */}
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6128] via-[#00DF8F] to-[#00DF8F] transition-all duration-500"
                          style={{ width: `${Math.max(4, percent)}%` }}
                        />
                      </div>

                      {/* Realtime User flow status */}
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-gray-400">
                          {isPending ? (
                            <span className="text-amber-400/90 font-medium">
                              ⏳ Waiting for admin approval to accept joins...
                            </span>
                          ) : joined === 0 ? (
                            'Waiting for users to join...'
                          ) : (
                            <span className="text-[#00DF8F] font-semibold">
                              ● {joined} {joined === 1 ? 'user has' : 'users have'} completed & joined!
                            </span>
                          )}
                        </span>
                        <span className="text-gray-500 font-mono text-[10px]">
                          Target: {target.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Details & Target Link */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Reward Info */}
                      <div className="flex items-center space-x-2">
                        {camp.usdtReward > 0 ? (
                          <div className="flex items-center space-x-1 bg-[#00DF8F]/10 px-2 py-1 rounded-xl text-xs font-black text-[#00DF8F]">
                            <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span>+{camp.usdtReward} USDT / user</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 bg-[#FBBF24]/10 px-2 py-1 rounded-xl text-xs font-black text-[#FBBF24]">
                            <img src="/fn_coin.png" alt="FN" className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span>+{camp.fgReward || 5} FN / user</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {camp.link && (
                          <a
                            href={camp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer border border-white/5 text-xs font-black flex items-center space-x-1"
                            title="Open Target Link"
                          >
                            <span>Visit Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TELEGRAM BOT ADMIN VERIFICATION POPUP MODAL */}
      {/* ============================================================== */}
      {showBotAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#11141D] border border-[#2AABEE]/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative overflow-hidden">
            {/* Ambient Cyan Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#2AABEE]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowBotAdminModal(false);
                setBotAdminError('');
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center pt-2 mb-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2AABEE]/15 border border-[#2AABEE]/30 flex items-center justify-center shadow-lg shadow-[#2AABEE]/20 mb-3">
                <img src="/telegram_logo.png" alt="Telegram" className="w-9 h-9 object-contain" />
              </div>

              <h3 className="text-lg font-black text-white tracking-tight">
                Add Bot as Administrator
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Please add our verification bot to your channel or group with Admin rights so we can track and verify member joins.
              </p>
            </div>

            {/* Instructions Steps Card */}
            <div className="bg-[#0C0E14] border border-white/10 rounded-2xl p-3.5 mb-3.5 space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#2AABEE]/20 text-[#2AABEE] flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>Open your Channel / Group &gt; Settings &gt; <strong>Administrators</strong>.</span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#2AABEE]/20 text-[#2AABEE] flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>Search and add our official bot:</span>
              </div>

              {/* Bot Username Pill with 1-Click Copy */}
              <div className="bg-[#141824] border border-[#2AABEE]/30 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-[#2AABEE]" />
                  <span className="text-xs font-mono font-black text-[#2AABEE]">
                    @{botUsername}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyBot}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center space-x-1 cursor-pointer transition-all ${
                    copiedBot
                      ? 'bg-[#00DF8F] text-black shadow-md'
                      : 'bg-[#2AABEE] text-white hover:bg-[#2AABEE]/80'
                  }`}
                >
                  {copiedBot ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#2AABEE]/20 text-[#2AABEE] flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Grant <strong>"Invite Users via Link"</strong> &amp; <strong>"Manage Chat"</strong> permission.</span>
              </div>
            </div>

            {/* Quick Open in Telegram Button */}
            <a
              href={`https://t.me/${botUsername}?startchannel=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#2AABEE]/15 hover:bg-[#2AABEE]/25 border border-[#2AABEE]/40 text-[#2AABEE] text-xs font-black flex items-center justify-center space-x-2 mb-3 cursor-pointer transition-all"
            >
              <img src="/telegram_logo.png" alt="Telegram" className="w-4 h-4 object-contain" />
              <span>Open Telegram &amp; Add Bot</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Channel Target URL Preview */}
            <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 mb-3 text-[11px] flex items-center justify-between text-gray-400">
              <span className="truncate max-w-[85%] font-mono">
                Target: {link}
              </span>
              <Globe className="w-3.5 h-3.5 text-[#2AABEE] shrink-0" />
            </div>

            {/* Error Message Alert */}
            {botAdminError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3 text-left animate-fadeIn">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-300 leading-tight">
                    {botAdminError}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Bottom Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowBotAdminModal(false);
                  setBotAdminError('');
                }}
                className="py-3 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-black transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={verifyingAdmin || submitting}
                onClick={handleVerifyAndSubmit}
                className="py-3 px-3 rounded-2xl bg-[#00DF8F] hover:bg-[#00c57e] text-black text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-[#00DF8F]/25 active:scale-95 transition-all"
              >
                {verifyingAdmin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Verify &amp; Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
