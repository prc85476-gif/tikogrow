import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Copy,
  Share2,
  Calendar,
  Award,
  ChevronRight,
  Flame,
  Check,
  UserCheck
} from 'lucide-react';

export default function FoxActivityPage() {
  const { user, referralMilestones, claimReferralMilestone, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'milestones' | 'log'
  const [copied, setCopied] = useState(false);

  const botUsername = 'TikoGrowbot';
  const referralCode = user.referralCode || (user.id ? `ref_${user.id}` : 'ref_802793');
  const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `🚀 Join Tiko Grow and earn free USDT & FN Coins by completing easy tasks!\n\n💰 Fast automated payouts & 5% lifetime commission!\n\nUse my invite link: ${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  // Filter only the 3 designated milestone tiers: 10, 50, 100
  const activeMilestones = (referralMilestones || [])
    .filter((m) => m.required === 10 || m.required === 50 || m.required === 100)
    .sort((a, b) => a.required - b.required);

  const renderMilestoneCard = (milestone) => {
    const current = milestone.currentCount !== undefined ? Number(milestone.currentCount) : Number(user.activeReferralCount || 0);
    const required = milestone.required;
    const isClaimed =
      milestone.claimed ||
      (user.claimedMilestones && user.claimedMilestones.includes(milestone.id));
    const canClaim = milestone.canClaim !== undefined ? milestone.canClaim : (current >= required && !isClaimed);

    return (
      <div
        key={milestone.id}
        className="foxtask-card rounded-2xl p-4 flex items-center justify-between border border-white/5 transition-all shadow-lg"
      >
        {/* Left Icon + Info (Styled exactly like Task Page cards) */}
        <div className="flex items-center space-x-3 max-w-[68%]">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#161B26] to-[#202738] border border-white/10 flex items-center justify-center shrink-0 shadow-sm text-white">
            {milestone.required === 10 ? (
              <Users className="w-5 h-5 text-[#2AABEE]" />
            ) : milestone.required === 50 ? (
              <Flame className="w-5 h-5 text-[#FF6128]" />
            ) : (
              <Award className="w-5 h-5 text-[#FBBF24]" />
            )}
          </div>

          <div className="min-w-0">
            {/* Title */}
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-extrabold text-white truncate">
                {milestone.title || `${milestone.required} Active Referrals`}
              </h4>
            </div>

            {/* Rewards Row */}
            <div className="flex items-center space-x-2.5 mt-1.5 flex-wrap">
              {/* USDT Reward */}
              <div className="flex items-center space-x-1 text-xs font-black text-[#00DF8F]">
                <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>+${milestone.usdtReward.toFixed(2)}</span>
              </div>

              {/* Progress dash indicator & code */}
              <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-semibold">
                <span className="w-4 h-1 bg-[#FF6128] rounded-full inline-block"></span>
                <span className="font-mono text-gray-300">
                  {current}/{required}
                </span>
                <span className="text-gray-500 font-mono text-[10px]">#REF{required}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Button (START / CLAIM / DONE - identical to Task Page) */}
        <button
          type="button"
          onClick={() => canClaim && claimReferralMilestone(milestone.id)}
          disabled={!canClaim && !isClaimed}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all ${
            isClaimed
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
              : canClaim
              ? 'btn-hero-orange text-white shadow-md shadow-[#FF6128]/25 active:scale-95 animate-pulse'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
          }`}
        >
          {isClaimed ? (
            <span className="flex items-center space-x-1 text-[#00DF8F]">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>DONE</span>
            </span>
          ) : canClaim ? (
            <span>CLAIM</span>
          ) : (
            <span>START</span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="pt-2 px-4 pb-28 select-none space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between text-gray-300 py-1 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#FF6128]" />
          <h2 className="font-black text-white text-base tracking-tight">Referral & Rewards</h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#00DF8F]">
          Code: {referralCode}
        </span>
      </div>

      {/* Top Segmented Navigation Tabs */}
      <div className="grid grid-cols-3 p-1 bg-[#12141A] border border-white/10 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('invite')}
          className={`py-2 px-1 text-xs font-black rounded-xl transition-all cursor-pointer text-center truncate ${
            activeTab === 'invite'
              ? 'bg-[#FF6128] text-white shadow-md shadow-[#FF6128]/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Invite Link
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`py-2 px-1 text-xs font-black rounded-xl transition-all cursor-pointer text-center truncate ${
            activeTab === 'milestones'
              ? 'bg-[#FF6128] text-white shadow-md shadow-[#FF6128]/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Milestones (3)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('log')}
          className={`py-2 px-1 text-xs font-black rounded-xl transition-all cursor-pointer text-center truncate ${
            activeTab === 'log'
              ? 'bg-[#FF6128] text-white shadow-md shadow-[#FF6128]/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Activity Log
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: INVITE LINK & STATS */}
      {/* ============================================================== */}
      {activeTab === 'invite' && (
        <div className="space-y-4">
          {/* Referral Stats Cards (Clean row, hero header completely removed) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="foxtask-card p-4 rounded-3xl border border-white/10 shadow-lg">
              <span className="text-[11px] text-gray-400 font-bold block uppercase tracking-wider">
                Total Invites
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {user.referralCount || 0}
              </div>
              <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                Active Friends Joined
              </span>
            </div>

            <div className="foxtask-card p-4 rounded-3xl border border-[#00DF8F]/30 bg-gradient-to-br from-[#12151E] to-[#0E1A16] shadow-lg">
              <span className="text-[11px] text-gray-400 font-bold block uppercase tracking-wider">
                Cash Earned
              </span>
              <div className="text-2xl font-black text-[#00DF8F] font-mono mt-1">
                ${Number(user.referralUsdtEarned || 0).toFixed(2)}
              </div>
              <span className="text-[10px] text-[#00DF8F] font-medium block mt-0.5">
                Credited to USDT Balance
              </span>
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="bg-[#12141A] border border-white/10 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                Your Personal Referral Link
              </span>
              <span className="text-[10px] text-gray-500 font-mono">100% Verified Tracking</span>
            </div>

            {/* Truncated Link Box */}
            <div className="flex items-center bg-[#090B0F] border border-white/10 rounded-2xl p-3 focus-within:border-[#FF6128] transition-colors">
              <span className="text-xs text-gray-300 font-mono truncate mr-2 select-all flex-1">
                {referralLink}
              </span>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white shrink-0 cursor-pointer transition-colors"
                title="Copy Link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#00DF8F] stroke-[3]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#FF6128]" />
                )}
              </button>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-3 px-3 rounded-2xl border text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                  copied
                    ? 'bg-[#00DF8F]/15 border-[#00DF8F] text-[#00DF8F]'
                    : 'bg-[#181B24] border-white/10 hover:border-white/20 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareTelegram}
                className="py-3 px-3 rounded-2xl btn-hero-orange text-white text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-[#FF6128]/25 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Telegram</span>
              </button>
            </div>
          </div>

          {/* Jump to Milestones Card */}
          <div
            onClick={() => setActiveTab('milestones')}
            className="foxtask-card rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-[#FF6128]/30 hover:border-[#FF6128] transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6128]/15 text-[#FF6128] flex items-center justify-center font-black">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white group-hover:text-[#FF6128] transition-colors">
                  Referral Cash Milestones (3 Levels)
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  10 Ref = $0.02 • 50 Ref = $1.00 • 100 Ref = $5.00 USDT
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: REFERRAL MILESTONES (Styled exactly like Task Page cards) */}
      {/* ============================================================== */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Referral Tasks ({activeMilestones.length})
            </span>
            <span className="text-xs text-[#00DF8F] font-bold font-mono">
              Earn up to $5.00 USDT
            </span>
          </div>

          {/* Active Referral Rule Banner */}
          <div className="p-3 rounded-xl bg-[#FF6128]/10 border border-[#FF6128]/25 flex items-start space-x-2.5 text-xs text-gray-300">
            <Users className="w-4 h-4 text-[#FF6128] shrink-0 mt-0.5" />
            <span><strong className="text-white">Active Referral Rule:</strong> An invited user counts toward milestones once they complete at least <strong className="text-[#00DF8F]">50 tasks</strong>.</span>
          </div>

          {/* Milestone Task Cards (Black color style matching task page) */}
          <div className="space-y-2.5">
            {activeMilestones.map((milestone) => renderMilestoneCard(milestone))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DAILY ACTIVITY & STREAK LOG */}
      {/* ============================================================== */}
      {activeTab === 'log' && (
        <div className="space-y-3.5">
          <div className="foxtask-card rounded-3xl p-5 flex items-center space-x-3.5 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6128]/15 border border-[#FF6128]/30 flex items-center justify-center text-[#FF6128] shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Daily Streak &amp; Log</h3>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Check in daily on the home page to increase your multiplier and claim free tokens.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">
              Account Activity History
            </h4>

            {[
              {
                id: 1,
                title: '3-Tier Referral Rewards Active',
                desc: '10 Ref = $0.02 | 50 Ref = $1.00 | 100 Ref = $5.00 USDT',
                time: 'Live',
                icon: '⚡'
              },
              {
                id: 2,
                title: 'Verified Member Account',
                desc: `Registered Member ID #${String(user.id || '802793').slice(-6)}`,
                time: 'Active',
                icon: '🦊'
              },
              {
                id: 3,
                title: 'Sponsored Tasks Portal',
                desc: 'Telegram, Twitter (X) & Google Ads verified settlement',
                time: 'Active',
                icon: '🎯'
              }
            ].map((act) => (
              <div
                key={act.id}
                className="foxtask-card rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{act.icon}</span>
                  <div>
                    <h5 className="text-sm font-black text-white">{act.title}</h5>
                    <p className="text-xs text-gray-400 mt-0.5">{act.desc}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-gray-500 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
