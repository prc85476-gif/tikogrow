import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
  Radio,
  Check,
  ExternalLink,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://tiko-tg-proxy.prc85476.workers.dev/api');

export default function FoxDepositPage() {
  const { setActiveTab, user, setUser, showToast, depositUsdt } = useApp();

  const [network, setNetwork] = useState('BEP-20');
  const [copied, setCopied] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(null); // { amount: number, time: string }
  const [countdown, setCountdown] = useState(3);

  // Address & session data state: { address, requestId, depositId }
  const [currentSession, setCurrentSession] = useState({
    address: '',
    requestId: '',
    depositId: ''
  });

  // Track session address so it stays consistent during session
  const fetchOrGetSessionAddress = async (net, forceNew = false) => {
    const sessionKey = `foxtask_relay_dep_${net}`;
    
    // 1. Check sessionStorage first (unless user explicitly requests a fresh address)
    if (!forceNew) {
      try {
        const cached = sessionStorage.getItem(sessionKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.address) {
            setCurrentSession(parsed);
            return parsed;
          }
        }
      } catch {}
    }

    // 2. Request from backend Relay API
    setAddressLoading(true);
    try {
      const res = await fetch(`${API_BASE}/deposit/relay/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest_user',
          network: net,
          forceNew
        })
      });

      if (res.ok) {
        const data = await res.json();
        const sessionObj = {
          address: data.address,
          requestId: data.requestId || '',
          depositId: data.depositId || ''
        };
        setCurrentSession(sessionObj);
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(sessionObj));
        } catch {}
        if (forceNew) {
          showToast(`Generated new ${net} deposit address!`, 'info');
        }
        return sessionObj;
      }
    } catch (err) {
      console.warn('Error fetching Relay deposit address:', err);
    } finally {
      setAddressLoading(false);
    }

    // Fallback static addresses if offline
    const fallbacks = {
      'BEP-20': '0x749675a232725a18fac41925cfac6740d77f4537',
      'TRC-20': 'TMUuqpK31o6XnkyuamFgHgNfLUeErFRZ6R',
      'TON': 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N'
    };
    const fallbackObj = {
      address: fallbacks[net] || fallbacks['BEP-20'],
      requestId: '',
      depositId: ''
    };
    setCurrentSession(fallbackObj);
    return fallbackObj;
  };

  // On network change: load address for this network
  useEffect(() => {
    fetchOrGetSessionAddress(network);
    setCheckCount(0);
  }, [network]);

  // 3-SECOND AUTOMATIC BACKGROUND POLLING
  useEffect(() => {
    if (depositSuccess) return; // Stop polling once payment is confirmed

    const interval = setInterval(async () => {
      setCountdown((prev) => (prev <= 1 ? 3 : prev - 1));

      // Trigger status check every 3 seconds
      if (countdown <= 1) {
        await checkDepositStatus(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, depositSuccess, countdown]);

  const checkDepositStatus = async (isManual = false) => {
    if (checking) return;
    if (isManual) setChecking(true);

    try {
      const queryObj = {
        depositId: currentSession.depositId || '',
        requestId: currentSession.requestId || '',
        userId: user?.id || 'guest_user',
        network
      };
      const query = new URLSearchParams(queryObj);

      const res = await fetch(`${API_BASE}/deposit/relay/status?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCheckCount((c) => c + 1);
        setLastCheckTime(new Date().toLocaleTimeString());

        if (data.status === 'success' || data.credited) {
          const credited = Number(data.amount || 0.1);
          setDepositSuccess({
            amount: credited,
            time: new Date().toLocaleTimeString()
          });

          // Trigger Confetti Celebration
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {}

          showToast(`Deposit Confirmed! +$${credited.toFixed(2)} USDT Credited to your Topup Balance`, 'success');

          // Clear this session so future deposit generates a fresh order
          try {
            sessionStorage.removeItem(`foxtask_relay_dep_${network}`);
          } catch {}

          // Immediately sync user context & cache
          if (data.user) {
            setUser(data.user);
            try {
              localStorage.setItem('foxtask_user_cache', JSON.stringify(data.user));
            } catch {}
          } else {
            setUser((prev) => {
              const updated = {
                ...prev,
                depositBalance: Number(prev?.depositBalance || 0) + credited
              };
              try {
                localStorage.setItem('foxtask_user_cache', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        } else if (data.status === 'pending') {
          if (isManual) {
            showToast('Deposit detected on blockchain! Confirmations in progress...', 'info');
          }
        } else if (isManual) {
          showToast('Scanning Blockchain: Payment not detected yet. Please transfer USDT first.', 'info');
        }
      }
    } catch (err) {
      if (isManual) showToast('Error querying blockchain status. Please retry in a moment.', 'error');
    } finally {
      if (isManual) setChecking(false);
    }
  };

  const handleCopy = () => {
    if (!currentSession.address) return;
    navigator.clipboard?.writeText(currentSession.address);
    setCopied(true);
    showToast('Deposit address copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAddress = currentSession.address || 'Loading...';

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white pb-28 pt-2 px-4 select-none">
      {/* Top Header Row with Back Button */}
      <div className="flex items-center justify-between py-2 border-b border-white/5 mb-4">
        <button
          onClick={() => setActiveTab('add-task')}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#12141A] border border-white/10 flex items-center justify-center text-white shadow-sm hover:border-[#FF6128]/50">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">Back</span>
        </button>

        <div className="flex items-center space-x-2 font-bold text-sm text-white">
          <img src="/usdt.png" alt="USDT" className="w-5 h-5 rounded-full object-cover shrink-0" />
          <span>Instant Crypto Deposit</span>
        </div>

        <div className="w-9"></div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL BANNER */}
      {depositSuccess && (
        <div className="bg-[#00DF8F]/15 border-2 border-[#00DF8F] rounded-3xl p-5 mb-5 text-center animate-fadeIn shadow-2xl shadow-[#00DF8F]/20">
          <div className="w-12 h-12 rounded-full bg-[#00DF8F] text-black mx-auto flex items-center justify-center mb-2 shadow-lg">
            <CheckCircle2 className="w-7 h-7 stroke-[3]" />
          </div>
          <h3 className="text-base font-black text-white">Payment Confirmed!</h3>
          <p className="text-xs text-[#00DF8F] font-bold mt-1">
            +${depositSuccess.amount.toFixed(2)} USDT added to your balance
          </p>
          <div className="text-[10px] text-gray-400 mt-2 font-mono">
            Settled on blockchain at {depositSuccess.time}
          </div>
        </div>
      )}

      {/* Network Selector (BEP-20, TRON TRC-20, TON) */}
      <div className="mb-4">
        <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
          Select Deposit Coin / Network
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'BEP-20', label: 'USDT (BEP-20)', tag: 'BNB Chain' },
            { id: 'TRC-20', label: 'TRON (TRC-20)', tag: 'TRX Network' },
            { id: 'TON', label: 'TON Network', tag: 'TON Ecosystem' }
          ].map((net) => (
            <button
              type="button"
              key={net.id}
              onClick={() => {
                setNetwork(net.id);
                setDepositSuccess(null);
              }}
              className={`py-2.5 px-2 rounded-2xl text-center transition-all cursor-pointer border ${
                network === net.id
                  ? 'bg-[#FF6128] text-white border-[#FF6128] shadow-md shadow-[#FF6128]/25 scale-[1.02]'
                  : 'foxtask-card text-gray-400 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="text-xs font-black">{net.id}</div>
              <div className="text-[10px] opacity-80 font-mono mt-0.5">{net.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* LIVE 3-SECOND SCANNER STATUS BAR */}
      <div className="foxtask-card rounded-2xl p-3 mb-4 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DF8F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00DF8F]"></span>
          </span>
          <span className="font-bold text-gray-200 text-[11px]">
            Live Scanner Active
          </span>
        </div>
        <div className="text-[11px] font-mono text-gray-400 flex items-center space-x-1.5">
          <span>Auto-checks in</span>
          <span className="w-4 h-4 rounded bg-[#FF6128]/20 text-[#FF6128] font-bold text-center inline-block text-[10px] leading-4">
            {countdown}s
          </span>
        </div>
      </div>

      {/* Deposit QR & Address Card */}
      <div className="foxtask-card rounded-3xl p-5 mb-4 border border-white/10 text-center relative overflow-hidden shadow-xl">
        {/* Network Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-[#00DF8F] mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00DF8F]" />
          <span>Smart Gateway ({network})</span>
        </div>

        {/* QR Code Container */}
        <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-2.5 shadow-2xl flex items-center justify-center mb-4 relative">
          {addressLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-800">
              <RefreshCw className="w-8 h-8 animate-spin text-[#FF6128] mb-2" />
              <span className="text-xs font-bold">Generating Session Address...</span>
            </div>
          ) : (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentAddress)}`}
              alt="Deposit QR Code"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Address Row with Copy */}
        <div className="text-left mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-gray-400">
              Your {network} Deposit Address:
            </span>
            <button
              type="button"
              onClick={() => fetchOrGetSessionAddress(network, true)}
              title="Click to generate a fresh address"
              className="text-[10px] text-[#00DF8F] hover:text-[#00DF8F]/80 font-mono flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3 inline" />
              <span>Get New Address</span>
            </button>
          </div>

          <div className="bg-[#0C0E14] border border-white/10 rounded-2xl p-3 flex items-center justify-between space-x-2">
            <span className="text-xs font-mono text-gray-300 truncate select-all">
              {currentAddress}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-[#00DF8F] text-black shadow-md'
                  : 'bg-[#FF6128] text-white hover:bg-[#FF7533]'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PERMANENT ADDRESS GUARANTEE BANNER */}
        <div className="flex items-center space-x-2 text-[11px] text-gray-400 bg-white/5 rounded-xl p-2.5 text-left mb-3 border border-white/5">
          <Lock className="w-4 h-4 text-[#00DF8F] shrink-0" />
          <span>
            <strong>Automated Smart Gateway:</strong> Scan the QR code or copy the address above. Payment is automatically detected & credited instantly.
          </span>
        </div>

        {/* Warning Notice */}
        <div className="flex items-center space-x-2 text-[11px] text-gray-400 bg-white/5 rounded-xl p-2.5 text-left border border-white/5">
          <AlertCircle className="w-4 h-4 text-[#FF6128] shrink-0" />
          <span>
            Send only <strong>USDT ({network})</strong> to this address. Minimum deposit is <strong>0.1 USDT ($0.10)</strong>.
          </span>
        </div>
      </div>

      {/* Manual Check Button & Scanner Stats */}
      <div className="space-y-3">
        <button
          type="button"
          disabled={checking}
          onClick={() => checkDepositStatus(true)}
          className="w-full py-4 rounded-2xl btn-hero-orange text-white text-base font-black flex items-center justify-center space-x-2 shadow-xl shadow-[#FF6128]/30 cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Querying Blockchain...' : 'Check My Deposit Now'}</span>
        </button>

        {checkCount > 0 && (
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-2 font-mono">
            <span>Scanned: {checkCount} times (every 3s)</span>
            <span>Last checked: {lastCheckTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
