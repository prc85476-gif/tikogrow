import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Megaphone,
  Sliders,
  Search,
  Check,
  Trash2,
  Copy,
  ExternalLink,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Send,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export default function AdminPanelPage() {
  const {
    user,
    config,
    tasks,
    setActiveTab,
    showToast,
    adminCampaigns,
    adminApproveCampaign,
    adminRejectCampaign,
    adminDeleteCampaign,
    adminWithdrawals,
    adminMarkWithdrawalPaid,
    adminRejectWithdrawal,
    adminBroadcasts,
    adminSendBroadcast,
    adminDeleteBroadcast,
    adminAdjustUserBalance,
    adminUpdateConfig,
    logoutAdmin
  } = useApp();

  const [currentTab, setCurrentTab] = useState('overview'); // 'overview' | 'campaigns' | 'withdrawals' | 'broadcast' | 'users' | 'settings'

  // Campaigns filter
  const [campaignFilter, setCampaignFilter] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [activeRejectId, setActiveRejectId] = useState(null);

  // Withdrawals filter
  const [withdrawFilter, setWithdrawFilter] = useState('pending'); // 'all' | 'pending' | 'completed' | 'rejected'
  const [txHashInput, setTxHashInput] = useState('');
  const [activePayId, setActivePayId] = useState(null);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('');

  // User Search & Adjust Balance Form
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [usdtDeltaInput, setUsdtDeltaInput] = useState('');
  const [fgDeltaInput, setFgDeltaInput] = useState('');
  const [balanceNoteInput, setBalanceNoteInput] = useState('');

  // System Settings Form
  const [rateInput, setRateInput] = useState(config.rate || 0.001);
  const [minWithdrawInput, setMinWithdrawInput] = useState(config.minWithdrawUsdt || 1.0);
  const [tgRewardInput, setTgRewardInput] = useState(0.015);
  const [twRewardInput, setTwRewardInput] = useState(0.01);
  const [checkinRewardInput, setCheckinRewardInput] = useState(0.002);

  // Stats calculation
  const pendingCampaigns = (adminCampaigns || []).filter((c) => c.status === 'pending');
  const pendingWithdrawals = (adminWithdrawals || []).filter((w) => w.status === 'pending');
  const completedWithdrawals = (adminWithdrawals || []).filter((w) => w.status === 'completed' || w.status === 'paid');
  const totalPaidUsdt = completedWithdrawals.reduce((sum, w) => sum + (Number(w.amountUsdt) || 0), 0);

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Please enter both title and message', 'error');
      return;
    }
    adminSendBroadcast({
      title: broadcastTitle,
      message: broadcastMessage,
      url: broadcastUrl
    });
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastUrl('');
    showToast('Broadcast announced to all users! 📣', 'success');
  };

  const handleUserSearch = () => {
    const q = searchUserId.trim().toLowerCase();
    if (!q) {
      setSelectedUser(null);
      return;
    }
    // Search current user or simulated user
    if (q === (user.id || '').toLowerCase() || q === (user.username || '').toLowerCase() || q === 'alamin' || q === 'lkgjdfjklgndefs56df4') {
      setSelectedUser(user);
    } else {
      setSelectedUser({
        id: searchUserId,
        username: searchUserId,
        firstName: 'Member ' + searchUserId.slice(-4),
        usdtBalance: 0.15,
        fgBalance: 120,
        depositBalance: 5.0,
        referralCount: 4,
        doneTasksCount: 6,
        isBanned: false
      });
    }
  };

  const handleAdjustBalance = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const usdtDelta = Number(usdtDeltaInput) || 0;
    const fgDelta = Number(fgDeltaInput) || 0;
    adminAdjustUserBalance(selectedUser.id, usdtDelta, fgDelta, balanceNoteInput);
    setSelectedUser((prev) => ({
      ...prev,
      usdtBalance: Number(((prev.usdtBalance || 0) + usdtDelta).toFixed(4)),
      fgBalance: Number(((prev.fgBalance || 0) + fgDelta).toFixed(2))
    }));
    setUsdtDeltaInput('');
    setFgDeltaInput('');
    setBalanceNoteInput('');
    showToast('User balance successfully updated!', 'success');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    adminUpdateConfig({
      rate: Number(rateInput),
      minWithdrawUsdt: Number(minWithdrawInput),
      tgReward: Number(tgRewardInput),
      twReward: Number(twRewardInput),
      checkinReward: Number(checkinRewardInput)
    });
    showToast('System configuration saved!', 'success');
  };

  const filteredCampaigns = (adminCampaigns || []).filter((c) => {
    if (campaignFilter === 'all') return true;
    return c.status === campaignFilter;
  });

  const filteredWithdrawals = (adminWithdrawals || []).filter((w) => {
    if (withdrawFilter === 'all') return true;
    if (withdrawFilter === 'completed') return w.status === 'completed' || w.status === 'paid';
    return w.status === withdrawFilter;
  });

  return (
    <div className="pt-2 px-4 pb-28 select-none space-y-4">
      {/* Admin Top App Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Admin</span>
        </button>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-[#FF6128]/20 border border-amber-500/30 text-amber-400 text-xs font-black shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>OWNER ADMIN 👑</span>
        </div>

        <button
          onClick={logoutAdmin}
          className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          title="Sign out from Admin Panel"
        >
          Logout
        </button>
      </div>

      {/* Admin Owner Identity Badge */}
      <div className="foxtask-card rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 via-transparent to-[#FF6128]/10 border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Verified System Controller
              </div>
              <h3 className="text-sm font-black text-white font-mono">
                @lkgjdfjklgndefs56df4
              </h3>
              <p className="text-[11px] text-gray-400">
                Master Authority • Zero Restrictions
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00DF8F]/20 text-[#00DF8F] border border-[#00DF8F]/30">
              ● Online
            </span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 text-xs font-black">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            currentTab === 'overview'
              ? 'bg-[#FF6128] text-white shadow-md'
              : 'foxtask-card text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('campaigns')}
          className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 relative ${
            currentTab === 'campaigns'
              ? 'bg-[#FF6128] text-white shadow-md'
              : 'foxtask-card text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Campaigns</span>
          {pendingCampaigns.length > 0 && (
            <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-md">
              {pendingCampaigns.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('withdrawals')}
          className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 relative ${
            currentTab === 'withdrawals'
              ? 'bg-[#FF6128] text-white shadow-md'
              : 'foxtask-card text-gray-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Withdrawals</span>
          {pendingWithdrawals.length > 0 && (
            <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-md">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('broadcast')}
          className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            currentTab === 'broadcast'
              ? 'bg-[#FF6128] text-white shadow-md'
              : 'foxtask-card text-gray-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast</span>
        </button>

        <button
          onClick={() => setCurrentTab('users')}
          className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            currentTab === 'users'
              ? 'bg-[#FF6128] text-white shadow-md'
              : 'foxtask-card text-gray-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Users</span>
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            currentTab === 'settings'
              ? 'bg-[#FF6128] text-white shadow-md'
              : 'foxtask-card text-gray-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW METRICS                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Total Users */}
            <div className="foxtask-card rounded-2xl p-4">
              <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold">
                <Users className="w-3.5 h-3.5 text-[#2AABEE]" />
                <span>Total Bot Users</span>
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                24,890
              </div>
              <span className="text-[10px] text-gray-500 font-medium">+184 today</span>
            </div>

            {/* Total Referrals */}
            <div className="foxtask-card rounded-2xl p-4">
              <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Referrals</span>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
                6,420
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Invited by members</span>
            </div>

            {/* Pending Withdrawals */}
            <div className="foxtask-card rounded-2xl p-4 border border-rose-500/20">
              <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Payouts</span>
              </div>
              <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
                {pendingWithdrawals.length} Orders
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Awaiting approval</span>
            </div>

            {/* Total Paid Out */}
            <div className="foxtask-card rounded-2xl p-4">
              <div className="flex items-center space-x-1.5 text-xs text-[#00DF8F] font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Total Settled</span>
              </div>
              <div className="text-2xl font-black text-[#00DF8F] mt-1 font-mono">
                ${totalPaidUsdt.toFixed(2)}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">BEP-20 USDT</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="foxtask-card rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Quick Admin Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentTab('campaigns');
                  setCampaignFilter('pending');
                }}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-xs font-bold text-white border border-white/5"
              >
                <span>Review Pending Campaigns ({pendingCampaigns.length})</span>
                <span className="text-[#FF6128]">Open →</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('withdrawals');
                  setWithdrawFilter('pending');
                }}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-xs font-bold text-white border border-white/5"
              >
                <span>Review Pending Withdrawals ({pendingWithdrawals.length})</span>
                <span className="text-[#00DF8F]">Process →</span>
              </button>

              <button
                onClick={() => setCurrentTab('broadcast')}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-xs font-bold text-white border border-white/5"
              >
                <span>Broadcast New Announcement to All Users</span>
                <span className="text-amber-400">Compose →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: CAMPAIGNS APPROVAL & MANAGEMENT                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentTab === 'campaigns' && (
        <div className="space-y-3">
          {/* Subfilter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar text-xs font-bold">
            {['pending', 'approved', 'rejected', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setCampaignFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl uppercase transition-all whitespace-nowrap cursor-pointer ${
                  campaignFilter === filter
                    ? 'bg-[#FF6128] text-white shadow-md'
                    : 'foxtask-card text-gray-400 hover:text-white'
                }`}
              >
                {filter === 'pending'
                  ? `Pending (${pendingCampaigns.length})`
                  : filter}
              </button>
            ))}
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="foxtask-card rounded-2xl p-8 text-center text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-[#00DF8F] mx-auto mb-2" />
              <p className="text-sm font-bold">No campaigns in this view</p>
              <p className="text-xs text-gray-500 mt-1">All clean and up-to-date!</p>
            </div>
          ) : (
            filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="foxtask-card rounded-2xl p-4 space-y-3 border border-white/5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300 mr-2">
                      {camp.category || camp.type || 'Telegram'}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        camp.status === 'approved'
                          ? 'bg-[#00DF8F]/20 text-[#00DF8F] border border-[#00DF8F]/30'
                          : camp.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {camp.status || 'pending'}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1">
                      {camp.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Creator: {camp.creatorName || camp.creatorId || 'System'}
                    </p>
                  </div>

                  {camp.link && (
                    <a
                      href={camp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                      title="Inspect Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-[#0B0D12] p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Reward</span>
                    <span className="font-black text-[#00DF8F] font-mono">
                      ${camp.usdtReward || 0.015}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Target</span>
                    <span className="font-black text-white font-mono">
                      {camp.participants || 100}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Joined</span>
                    <span className="font-black text-amber-400 font-mono">
                      {camp.joinedMembers || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-1">
                  {camp.status !== 'approved' && (
                    <button
                      onClick={() => adminApproveCampaign(camp.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#00DF8F] hover:bg-[#00DF8F]/90 text-black text-xs font-black flex items-center justify-center space-x-1 cursor-pointer transition-transform active:scale-95 shadow-md shadow-[#00DF8F]/20"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>APPROVE ✅</span>
                    </button>
                  )}

                  {camp.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        if (activeRejectId === camp.id) {
                          adminRejectCampaign(camp.id, rejectReasonInput || 'Declined by Administrator');
                          setActiveRejectId(null);
                          setRejectReasonInput('');
                        } else {
                          setActiveRejectId(camp.id);
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-black flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{activeRejectId === camp.id ? 'CONFIRM REJECT' : 'REJECT ❌'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => adminDeleteCampaign(camp.id)}
                    className="w-9 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reason Input if Reject clicked */}
                {activeRejectId === camp.id && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={rejectReasonInput}
                      onChange={(e) => setRejectReasonInput(e.target.value)}
                      placeholder="Reason for rejection (creator will be refunded)..."
                      className="w-full bg-[#0B0D12] border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-gray-500"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: WITHDRAWAL REQUESTS                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentTab === 'withdrawals' && (
        <div className="space-y-3">
          {/* Subfilter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar text-xs font-bold">
            {['pending', 'completed', 'rejected', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setWithdrawFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl uppercase transition-all whitespace-nowrap cursor-pointer ${
                  withdrawFilter === filter
                    ? 'bg-[#FF6128] text-white shadow-md'
                    : 'foxtask-card text-gray-400 hover:text-white'
                }`}
              >
                {filter === 'pending'
                  ? `Pending (${pendingWithdrawals.length})`
                  : filter === 'completed'
                  ? 'Paid'
                  : filter}
              </button>
            ))}
          </div>

          {filteredWithdrawals.length === 0 ? (
            <div className="foxtask-card rounded-2xl p-8 text-center text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-[#00DF8F] mx-auto mb-2" />
              <p className="text-sm font-bold">No withdrawals in this filter</p>
              <p className="text-xs text-gray-500 mt-1">Pending payout queue is clean!</p>
            </div>
          ) : (
            filteredWithdrawals.map((w) => (
              <div
                key={w.id}
                className="foxtask-card rounded-2xl p-4 space-y-3 border border-white/5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-black text-[#00DF8F] font-mono">
                        ${Number(w.amountUsdt || 0).toFixed(2)} USDT
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          w.status === 'completed' || w.status === 'paid'
                            ? 'bg-[#00DF8F]/20 text-[#00DF8F] border border-[#00DF8F]/30'
                            : w.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      User: {w.username || w.userId || 'Member'} • ID: #{String(w.userId).slice(-6)}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Date: {new Date(w.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/5 text-gray-300 uppercase">
                    BEP-20 (BSC)
                  </span>
                </div>

                {/* Address Box */}
                <div className="bg-[#0B0D12] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono text-gray-300">
                  <span className="truncate max-w-[240px] font-semibold text-white">
                    {w.bep20Address}
                  </span>
                  <button
                    onClick={() => handleCopy(w.bep20Address)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {w.txHash && (
                  <p className="text-[10px] font-mono text-[#00DF8F] truncate">
                    Tx: {w.txHash}
                  </p>
                )}

                {/* Actions */}
                {w.status === 'pending' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          adminMarkWithdrawalPaid(w.id, txHashInput || '0x_bep20_manual_transfer');
                          setActivePayId(null);
                          setTxHashInput('');
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#00DF8F] hover:bg-[#00DF8F]/90 text-black text-xs font-black flex items-center justify-center space-x-1 cursor-pointer shadow-md shadow-[#00DF8F]/20"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>MARK AS PAID / COMPLETED 💸</span>
                      </button>

                      <button
                        onClick={() => adminRejectWithdrawal(w.id, 'Declined by Administrator (USDT refunded)')}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-black cursor-pointer"
                      >
                        REJECT & REFUND ↩️
                      </button>
                    </div>

                    <input
                      type="text"
                      value={activePayId === w.id ? txHashInput : ''}
                      onFocus={() => setActivePayId(w.id)}
                      onChange={(e) => {
                        setActivePayId(w.id);
                        setTxHashInput(e.target.value);
                      }}
                      placeholder="Optional BSC TxHash (Transaction ID)..."
                      className="w-full bg-[#0B0D12] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono placeholder:text-gray-500"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: BROADCAST ANNOUNCEMENTS                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentTab === 'broadcast' && (
        <div className="space-y-4">
          <form onSubmit={handleSendBroadcast} className="foxtask-card rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Send Live Broadcast to All Users
            </h4>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g., 🚀 Special 2X USDT Rewards Active Today!"
                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write your announcement details for all members..."
                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Optional Action Link (URL)
              </label>
              <input
                type="text"
                value={broadcastUrl}
                onChange={(e) => setBroadcastUrl(e.target.value)}
                placeholder="https://t.me/..."
                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl btn-hero-orange text-white text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>SEND BROADCAST TO ALL USERS 📢</span>
            </button>
          </form>

          {/* Past Broadcasts */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider px-1">
              Active & Past Broadcasts
            </h4>
            {(adminBroadcasts || []).length === 0 ? (
              <div className="foxtask-card rounded-2xl p-6 text-center text-xs text-gray-500">
                No broadcasts sent yet.
              </div>
            ) : (
              (adminBroadcasts || []).map((bc) => (
                <div key={bc.id} className="foxtask-card rounded-2xl p-3.5 space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-white">{bc.title}</h5>
                    <button
                      onClick={() => adminDeleteBroadcast(bc.id)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                      title="Remove Broadcast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{bc.message}</p>
                  <p className="text-[9px] text-gray-500 font-mono">
                    {new Date(bc.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 5: USERS & BALANCE CONTROL                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentTab === 'users' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="foxtask-card rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Search User Account
            </h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center bg-[#0B0D12] border border-white/10 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="Enter Telegram Username or User ID..."
                  className="bg-transparent text-xs text-white outline-none w-full"
                />
              </div>
              <button
                onClick={handleUserSearch}
                className="py-2.5 px-4 rounded-xl bg-[#FF6128] text-white text-xs font-black cursor-pointer shadow-md"
              >
                Find
              </button>
            </div>
          </div>

          {/* User Details & Balance Adjustment */}
          {selectedUser && (
            <div className="foxtask-card rounded-2xl p-4 space-y-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">
                    {selectedUser.firstName || selectedUser.username}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-mono">
                    ID: #{selectedUser.id} • User: @{selectedUser.username || 'unknown'}
                  </p>
                </div>
                <span className="text-xs font-black text-[#00DF8F] font-mono bg-[#00DF8F]/10 px-2.5 py-1 rounded-xl">
                  {Number(selectedUser.usdtBalance || 0).toFixed(4)} USDT
                </span>
              </div>

              {/* Balances summary */}
              <div className="grid grid-cols-3 gap-2 bg-[#0B0D12] p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">USDT</span>
                  <span className="font-mono font-black text-[#00DF8F]">
                    ${Number(selectedUser.usdtBalance || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">FN Coins</span>
                  <span className="font-mono font-black text-amber-400">
                    {selectedUser.fgBalance || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Referrals</span>
                  <span className="font-mono font-black text-white">
                    {selectedUser.referralCount || 0}
                  </span>
                </div>
              </div>

              {/* Adjust Balance Form */}
              <form onSubmit={handleAdjustBalance} className="space-y-3 pt-1 border-t border-white/5">
                <h5 className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Adjust User Balance
                </h5>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">
                      USDT (+/-)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={usdtDeltaInput}
                      onChange={(e) => setUsdtDeltaInput(e.target.value)}
                      placeholder="+1.00 or -0.50"
                      className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">
                      FN Coins (+/-)
                    </label>
                    <input
                      type="number"
                      value={fgDeltaInput}
                      onChange={(e) => setFgDeltaInput(e.target.value)}
                      placeholder="+50 or -20"
                      className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={balanceNoteInput}
                  onChange={(e) => setBalanceNoteInput(e.target.value)}
                  placeholder="Reason / Note (e.g. VIP Bonus, Compensation)..."
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-2 text-xs text-white outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6128] text-white text-xs font-black cursor-pointer shadow-md"
                >
                  Apply Balance Adjustment
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 6: SYSTEM RATES & SETTINGS                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="foxtask-card rounded-2xl p-4 space-y-4">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
            System & Reward Configuration
          </h4>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              FN Coin to USDT Rate (1 FN = ? USDT)
            </label>
            <input
              type="number"
              step="0.0001"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono"
            />
            <span className="text-[10px] text-gray-500 block mt-1">
              Currently: 1,000 FN Coins = ${(Number(rateInput) * 1000).toFixed(2)} USDT
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Minimum Withdrawal Limit (USDT)
            </label>
            <input
              type="number"
              step="0.1"
              value={minWithdrawInput}
              onChange={(e) => setMinWithdrawInput(e.target.value)}
              className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Telegram Reward ($)
              </label>
              <input
                type="number"
                step="0.001"
                value={tgRewardInput}
                onChange={(e) => setTgRewardInput(e.target.value)}
                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Twitter (X) Reward ($)
              </label>
              <input
                type="number"
                step="0.001"
                value={twRewardInput}
                onChange={(e) => setTwRewardInput(e.target.value)}
                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Daily Check-in Reward ($ USDT)
            </label>
            <input
              type="number"
              step="0.001"
              value={checkinRewardInput}
              onChange={(e) => setCheckinRewardInput(e.target.value)}
              className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl btn-hero-orange text-white text-xs font-black cursor-pointer shadow-lg mt-2"
          >
            SAVE CONFIGURATION 💾
          </button>
        </form>
      )}
    </div>
  );
}

