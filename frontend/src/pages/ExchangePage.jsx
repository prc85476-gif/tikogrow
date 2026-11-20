import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeftRight, Coins, ArrowDown, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function ExchangePage() {
  const { user, config, swapTokens, loading, setActiveTab } = useApp();
  const [novaInput, setNovaInput] = useState('');

  const parsedAmount = Number(novaInput) || 0;
  const estimatedUsdt = (parsedAmount * config.rate).toFixed(4);

  const handlePercentage = (percent) => {
    const calculated = Math.floor((user.novaBalance || 0) * (percent / 100));
    setNovaInput(calculated > 0 ? String(calculated) : '');
  };

  const handleSwap = async () => {
    if (parsedAmount <= 0) return;
    const ok = await swapTokens(parsedAmount);
    if (ok) {
      setNovaInput('');
    }
  };

  return (
    <div className="px-4 pt-3 pb-28 space-y-4 relative z-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2 drop-shadow-sm">
          <ArrowLeftRight className="w-5 h-5 text-emerald-300" />
          <span>Token Converter</span>
        </h2>
        <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
          Instant liquidity swap between {config.coinName} protocol tokens and Tether (USDT).
        </p>
      </div>

      {/* Exchange Rate Pill - White Box */}
      <div className="white-box rounded-3xl p-4 flex items-center justify-between glow-card">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fixed Conversion Rate</span>
        <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 font-mono">
          1000 {config.coinName} = 1.00 USDT
        </span>
      </div>

      {/* Swap Box - White Box Card with Emerald Glow */}
      <div className="white-box rounded-3xl p-5 border-l-4 border-l-emerald-500 glow-emerald space-y-4">
        {/* From Token (NOVA) */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-bold">
            <span>Pay Allocation</span>
            <span>
              Available: <strong className="text-amber-700 font-extrabold">{user.novaBalance || 0} {config.coinName}</strong>
            </span>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
            <input
              type="number"
              value={novaInput}
              onChange={(e) => setNovaInput(e.target.value)}
              placeholder="0"
              className="bg-transparent text-2xl font-black text-slate-900 w-full outline-none placeholder:text-slate-400 font-mono"
            />
            <div className="flex items-center space-x-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shrink-0 shadow-sm shadow-amber-500/30">
              <Coins className="w-4 h-4 text-white" />
              <span>{config.coinName}</span>
            </div>
          </div>

          {/* Quick Percentages - White Box Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentage(pct)}
                className="py-1.5 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                {pct === 100 ? 'MAX' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Divider with swap icon */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/20 glow-emerald">
            <ArrowDown className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* To Token (USDT) */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-bold">
            <span>Receive Valuation</span>
            <span>
              Wallet: <strong className="text-emerald-700 font-extrabold">{user.usdtBalance?.toFixed(4) || '0.0000'} USDT</strong>
            </span>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-inner">
            <div className="text-2xl font-black text-emerald-600 w-full font-mono">
              {estimatedUsdt}
            </div>
            <div className="flex items-center space-x-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shrink-0 shadow-sm shadow-emerald-600/30">
              <span>USDT</span>
            </div>
          </div>
        </div>

        {/* Swap Details Summary */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Protocol Liquidity Fee</span>
            <span className="text-emerald-700 font-black">0.00% (Sponsored)</span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Guaranteed Slippage</span>
            <span className="text-slate-900 font-bold">0.00%</span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Settlement Network</span>
            <span className="text-amber-800 font-extrabold">BNB Smart Chain (BEP-20)</span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={loading || parsedAmount <= 0 || parsedAmount > (user.novaBalance || 0)}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            parsedAmount <= 0 || parsedAmount > (user.novaBalance || 0) || loading
              ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-xl shadow-emerald-600/30 glow-emerald active:scale-95'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>
            {parsedAmount > (user.novaBalance || 0)
              ? `Insufficient ${config.coinName} Holdings`
              : parsedAmount > 0
              ? `Execute Swap for ${estimatedUsdt} USDT`
              : 'Enter Amount to Swap'}
          </span>
        </button>
      </div>

      {/* Ready to withdraw CTA - White Box */}
      <div className="white-box rounded-3xl p-4.5 border-l-4 border-l-indigo-600 glow-primary flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Liquidity Withdrawal Ready</h4>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Transfer your USDT to external BSC BEP-20 addresses</p>
        </div>
        <button
          onClick={() => setActiveTab('withdraw')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black shadow-md shadow-indigo-500/30 cursor-pointer"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}
