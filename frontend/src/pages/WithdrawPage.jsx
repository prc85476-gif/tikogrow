import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';

export default function WithdrawPage() {
  const { user, config, submitWithdrawal, withdrawals, loading, showToast } = useApp();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [bep20Address, setBep20Address] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('withdraw');

  const handleMax = () => {
    if (user.usdtBalance && user.usdtBalance > 0) {
      setUsdtAmount(String(user.usdtBalance));
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const ok = await submitWithdrawal(usdtAmount, bep20Address);
    if (ok) {
      setUsdtAmount('');
      setBep20Address('');
      setActiveSubTab('history');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    showToast('BEP-20 address copied to clipboard', 'info');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Settled
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending Settlement
          </span>
        );
    }
  };

  return (
    <div className="px-4 pt-3 pb-28 space-y-4 relative z-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2 drop-shadow-sm">
          <Wallet className="w-5 h-5 text-purple-300" />
          <span>USDT Settlement</span>
        </h2>
        <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
          Direct liquidity transfer to Binance Smart Chain (BEP-20) addresses.
        </p>
      </div>

      {/* Sub tabs - White Box Pill Switcher */}
      <div className="grid grid-cols-2 p-1.5 white-box rounded-2xl glow-card">
        <button
          onClick={() => setActiveSubTab('withdraw')}
          className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'withdraw'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-600 hover:text-slate-900 font-bold'
          }`}
        >
          Withdrawal Request
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-600 hover:text-slate-900 font-bold'
          }`}
        >
          Ledger History ({withdrawals.length})
        </button>
      </div>

      {activeSubTab === 'withdraw' ? (
        <>
          {/* Balance Preview Card - White Box with Purple Glow */}
          <div className="white-box rounded-3xl p-5 border-l-4 border-l-purple-600 glow-purple">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Settlement Balance</span>
                <div className="text-3xl font-black text-slate-900 mt-0.5 font-mono">
                  {user.usdtBalance?.toFixed(4) || '0.0000'} <span className="text-xs text-slate-500 font-bold">USDT</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-black uppercase">Network</span>
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300 inline-block mt-1 font-mono">
                  BEP-20 (BSC)
                </span>
              </div>
            </div>
          </div>

          {/* Withdrawal Form - White Box */}
          <form onSubmit={handleWithdraw} className="white-box rounded-3xl p-5 border-l-4 border-l-blue-600 glow-primary space-y-4">
            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-bold">
                <span>Withdrawal Amount (USDT)</span>
                <span>
                  Threshold: <strong className="text-slate-900 font-extrabold">{config.minWithdrawUsdt} USDT</strong>
                </span>
              </div>

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
                <input
                  type="number"
                  step="0.01"
                  min={config.minWithdrawUsdt}
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-xl font-black text-slate-900 w-full outline-none placeholder:text-slate-400 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="px-3 py-1 text-xs font-black text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl border border-indigo-200 shrink-0 cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* BEP-20 Address Input */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-bold">
                <span>BEP-20 Destination Address</span>
                <span className="text-[10px] text-amber-700 font-bold">Binance Smart Chain</span>
              </div>

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
                <input
                  type="text"
                  value={bep20Address}
                  onChange={(e) => setBep20Address(e.target.value)}
                  placeholder="0x..."
                  className="bg-transparent text-xs font-mono font-bold text-slate-900 w-full outline-none placeholder:text-slate-400"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Supports MetaMask, Trust Wallet, and exchange deposit addresses on BSC.
              </p>
            </div>

            {/* Network Policy Notes */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-500">
              <div className="flex justify-between font-medium">
                <span>Network Gas Fee</span>
                <span className="text-emerald-700 font-black">0.00 USDT (Sponsored)</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Settlement Speed</span>
                <span className="text-slate-900 font-bold">Instant Batch Queue</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !usdtAmount || !bep20Address}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                loading || !usdtAmount || !bep20Address
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-600/30 glow-primary active:scale-95'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{loading ? 'Processing Queue...' : 'Authorize BEP-20 Payout'}</span>
            </button>
          </form>
        </>
      ) : (
        /* History Tab - White Boxes */
        <div className="space-y-3.5">
          {withdrawals.length === 0 ? (
            <div className="white-box rounded-3xl p-8 text-center glow-card">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-black text-slate-900">Zero Ledger Entries</h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Complete tasks or sponsor sessions to initiate your first BEP-20 cashout.
              </p>
            </div>
          ) : (
            withdrawals.map((item) => (
              <div
                key={item.id}
                className="white-box rounded-3xl p-4.5 glow-card space-y-2.5 border-l-4 border-l-indigo-600"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {item.amountUsdt.toFixed(2)} USDT
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 font-mono">
                    BEP-20
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-700">
                  <span className="truncate max-w-[240px] font-semibold">{item.bep20Address}</span>
                  <button
                    onClick={() => copyToClipboard(item.bep20Address)}
                    className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                    title="Copy address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
