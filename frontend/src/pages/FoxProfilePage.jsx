import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, ArrowLeftRight, ArrowUpRight, Copy, CheckCircle2, Clock, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function FoxProfilePage() {
  const { user, config, swapTokens, submitWithdrawal, withdrawals, showToast, theme, toggleTheme, isAdmin, loginAdmin, setActiveTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('withdraw'); // 'withdraw' | 'swap' | 'history'
  const [swapInput, setSwapInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bep20Address, setBep20Address] = useState('');

  const parsedSwap = Number(swapInput) || 0;
  const estimatedUsdt = (parsedSwap * config.rate).toFixed(4);

  const handleSwap = async () => {
    if (parsedSwap <= 0) return;
    const ok = await swapTokens(parsedSwap);
    if (ok) setSwapInput('');
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const ok = await submitWithdrawal(withdrawAmount, bep20Address);
    if (ok) {
      setWithdrawAmount('');
      setBep20Address('');
      setActiveSubTab('history');
    }
  };

  const copyAddress = (addr) => {
    navigator.clipboard?.writeText(addr);
    showToast('Address copied to clipboard!', 'info');
  };

  return (
    <div className="pt-2 px-4 pb-28 select-none space-y-4">
      {/* App Bar & Appearance Quick Switch */}
      <div className="flex items-center justify-between text-gray-300 text-sm">
        <span className="font-bold text-white text-base tracking-tight">FoxTask Profile & Wallet</span>
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 cursor-pointer text-xs font-bold text-white"
          title="Switch Appearance Mode"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Light Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Appearance Mode Setting Banner */}
      <div className="foxtask-card rounded-2xl p-3.5 flex items-center justify-between border border-white/5 transition-all">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-white/10 text-amber-400'
          }`}>
            {theme === 'light' ? <Sun className="w-5 h-5 fill-amber-500" /> : <Moon className="w-5 h-5 fill-indigo-400" />}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Appearance Mode</div>
            <div className="text-sm font-black text-white">
              {theme === 'light' ? 'Light Theme Active ☀️' : 'Dark Theme Active 🌙'}
            </div>
          </div>
        </div>

        {/* Interactive Toggle Switch */}
        <button
          onClick={toggleTheme}
          className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer ${
            theme === 'light' ? 'bg-[#FF6128]' : 'bg-gray-700'
          }`}
          title="Switch theme"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform flex items-center justify-center ${
              theme === 'light' ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-[#FF6128] fill-[#FF6128]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-700 fill-gray-700" />
            )}
          </div>
        </button>
      </div>

      {/* User Card */}
      <div className="foxtask-card rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#FF6128] to-[#FF9050] avatar-orange-glow flex items-center justify-center shrink-0 aspect-square">
            <div className="w-full h-full rounded-full bg-[#12151D] flex items-center justify-center aspect-square overflow-hidden border border-black/60 relative">
              <img
                src={user.photoUrl || user.photo_url || '/default_user.png'}
                alt={user.firstName || user.username || 'Telegram Profile'}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
              <div
                className="w-full h-full rounded-full bg-gradient-to-tr from-[#0088cc] via-[#24A1DE] to-[#34B7F1] items-center justify-center text-white font-extrabold text-lg select-none hidden"
              >
                {(user.firstName || user.username || 'M').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{user.firstName || user.username || 'Member'}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-[#FF6128] text-white text-[10px] font-black px-2 py-0.5 rounded-md leading-none">
                {user.level || 'LV.1'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              Member ID: {user.memberNumber || '#802,793'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 block font-bold uppercase">Network</span>
          <span className="text-xs font-black text-[#FF6128] bg-[#FF6128]/10 border border-[#FF6128]/30 px-2.5 py-1 rounded-xl inline-block mt-1 font-mono">
            BEP-20 (BSC)
          </span>
        </div>
      </div>

      {/* Wallet Balance Summary Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="foxtask-card rounded-2xl p-4">
          <div className="flex items-center space-x-1.5">
            <img src="/usdt.png" alt="USDT" className="w-4 h-4 rounded-full object-cover shrink-0" />
            <span className="text-xs font-bold text-gray-400">USDT Balance</span>
          </div>
          <div className="text-2xl font-black text-[#00DF8F] mt-1 font-mono">
            {user.usdtBalance?.toFixed(4) || '0.0000'}
          </div>
          <span className="text-[10px] text-gray-500 font-medium">Withdrawable to BSC</span>
        </div>

        <div className="foxtask-card rounded-2xl p-4">
          <div className="flex items-center space-x-1.5">
            <img src="/fn_coin.png" alt="FN Coin" className="w-4 h-4 rounded-full object-cover shrink-0" />
            <span className="text-xs font-bold text-gray-400">FN coin Balance</span>
          </div>
          <div className="text-2xl font-black text-[#FBBF24] mt-1 font-mono">
            {user.fgBalance || 0}
          </div>
          <span className="text-[10px] text-gray-500 font-medium">1000 FN = 1.00 USDT</span>
        </div>
      </div>

      {/* Sub Tabs: Withdraw, Swap, History */}
      <div className="grid grid-cols-3 p-1 foxtask-card rounded-2xl">
        {[
          { id: 'withdraw', label: 'Withdraw USDT' },
          { id: 'swap', label: 'Swap FN' },
          { id: 'history', label: `History (${withdrawals.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#FF6128] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Body */}
      {activeSubTab === 'withdraw' && (
        <form onSubmit={handleWithdraw} className="foxtask-card rounded-3xl p-5 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5 font-bold">
              <span className="flex items-center space-x-1.5">
                <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>Withdraw USDT Amount</span>
              </span>
              <span>Min: <strong className="text-white">{config.minWithdrawUsdt} USDT</strong></span>
            </div>

            <div className="flex items-center bg-[#0B0D12] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#FF6128]">
              <input
                type="number"
                step="0.01"
                min={config.minWithdrawUsdt}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-xl font-black text-white w-full outline-none font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setWithdrawAmount(String(user.usdtBalance || 0))}
                className="px-3 py-1 bg-[#FF6128]/20 text-[#FF6128] font-black text-xs rounded-xl border border-[#FF6128]/30 shrink-0 cursor-pointer"
              >
                MAX
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5 px-1">
              <span>Earned Balance: <strong className="text-[#00DF8F] font-mono">${(user.usdtBalance || 0).toFixed(2)} USDT</strong></span>
              <span className="text-gray-500 font-medium">Topup balance is reserved for tasks</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5 font-bold">
              <span>Your BEP-20 Wallet Address</span>
              <span className="text-[#FF6128] text-[10px]">Binance Smart Chain</span>
            </div>

            <div className="bg-[#0B0D12] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#FF6128]">
              <input
                type="text"
                value={bep20Address}
                onChange={(e) => setBep20Address(e.target.value)}
                placeholder="0x..."
                className="bg-transparent text-xs font-mono text-white w-full outline-none"
                required
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Supports Binance, Trust Wallet, MetaMask (BNB Smart Chain BEP-20).
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl btn-orange-3d text-white font-black text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
          >
            <img src="/usdt.png" alt="USDT" className="w-4 h-4 rounded-full object-cover shrink-0" />
            <span>Withdraw USDT to BEP-20</span>
          </button>
        </form>
      )}

      {activeSubTab === 'swap' && (
        <div className="foxtask-card rounded-3xl p-5 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5 font-bold">
              <span>Pay FN coin</span>
              <span>Available: <strong className="text-[#FBBF24]">{user.fgBalance || 0} FN</strong></span>
            </div>

            <div className="flex items-center bg-[#0B0D12] border border-white/10 rounded-2xl p-3.5">
              <input
                type="number"
                value={swapInput}
                onChange={(e) => setSwapInput(e.target.value)}
                placeholder="0"
                className="bg-transparent text-xl font-black text-white w-full outline-none font-mono"
              />
              <span className="text-xs font-black text-[#FBBF24] bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/30 flex items-center space-x-1">
                <img src="/fn_coin.png" alt="FN Coin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>FN coin</span>
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5 font-bold">
              <span>Receive USDT</span>
              <span>Rate: 1000 FN = 1.00 USDT</span>
            </div>

            <div className="flex items-center bg-[#0B0D12] border border-white/10 rounded-2xl p-3.5">
              <div className="text-xl font-black text-[#00DF8F] w-full font-mono">
                {estimatedUsdt}
              </div>
              <span className="text-xs font-black text-[#00DF8F] bg-[#00DF8F]/10 px-2.5 py-1 rounded-xl border border-[#00DF8F]/30 flex items-center space-x-1">
                <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <span>USDT</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleSwap}
            disabled={parsedSwap <= 0 || parsedSwap > (user.fgBalance || 0)}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              parsedSwap <= 0 || parsedSwap > (user.fgBalance || 0)
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'btn-orange-3d text-white shadow-lg'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Execute Swap to USDT</span>
          </button>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <div className="foxtask-card rounded-2xl p-8 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-bold">No withdrawals yet</p>
              <p className="text-xs text-gray-500 mt-1">Complete tasks to earn and cash out!</p>
            </div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="foxtask-card rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-[#00DF8F] font-mono">
                      {w.amountUsdt.toFixed(2)} USDT
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      {w.status}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-gray-400">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-[#0B0D12] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono text-gray-300">
                  <span className="truncate max-w-[240px]">{w.bep20Address}</span>
                  <button onClick={() => copyAddress(w.bep20Address)} className="text-gray-400 hover:text-white">
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

