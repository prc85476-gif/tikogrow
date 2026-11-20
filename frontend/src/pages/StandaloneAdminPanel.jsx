import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Wallet,
  Coins,
  Users,
  Send,
  Sliders,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Check,
  Copy,
  ArrowRight,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Filter,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Bot,
  Database,
  Activity,
  DollarSign,
  TrendingUp,
  CheckCheck,
  Layers,
  Award,
  Crown,
  Medal,
  Eye,
  Play,
  User,
  Image as ImageIcon
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://qz4gige81pt4u0yx81c5obvc.179.197.255.88.sslip.io/api');

function resolveAdminMediaUrl(url, filename = '') {
  if (!url && !filename) return '';
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:'))) {
    return url;
  }
  const root = API_BASE.replace(/\/api\/?$/, '');
  if (url) {
    return `${root}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return `${root}/api/proof-image/${filename}`;
}

function AdminSubmissionProofBox({ sub, onZoom }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [useDirectApi, setUseDirectApi] = useState(false);

  const primaryUrl = resolveAdminMediaUrl(sub.screenshotUrl);
  const directApiUrl = sub.screenshotFilename 
    ? `${API_BASE.replace(/\/api\/?$/, '')}/api/proof-image/${sub.screenshotFilename}` 
    : '';

  const currentSrc = useDirectApi && directApiUrl ? directApiUrl : primaryUrl;

  if (!sub.screenshotUrl && !sub.screenshotFilename) {
    return (
      <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-gray-400 font-mono">
        {sub.status === 'approved' 
          ? '✅ Image was automatically deleted from server storage upon approval to free up disk space.'
          : 'Image removed from server storage.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/60 min-h-[180px] flex items-center justify-center p-1">
        {!loadFailed ? (
          <>
            <img
              src={currentSrc}
              alt="User screenshot proof"
              className="max-h-48 w-full object-contain cursor-pointer transition-transform group-hover:scale-105 rounded-lg"
              onClick={() => onZoom(currentSrc)}
              onError={() => {
                if (!useDirectApi && directApiUrl) {
                  setUseDirectApi(true);
                } else {
                  setLoadFailed(true);
                }
              }}
            />
            <button
              type="button"
              onClick={() => onZoom(currentSrc)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-opacity space-x-1.5 cursor-pointer backdrop-blur-[2px]"
            >
              <Eye className="w-4 h-4" />
              <span>Click to View Full Size</span>
            </button>
          </>
        ) : (
          <div className="p-4 text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
            <p className="text-xs text-gray-300 font-bold">Screenshot proof image</p>
            <div className="flex items-center justify-center space-x-2 pt-1">
              <a
                href={currentSrc}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold font-mono inline-flex items-center space-x-1"
              >
                <span>Open Screenshot ↗</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setLoadFailed(false);
                  setUseDirectApi(!useDirectApi);
                }}
                className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-mono">
        <button
          type="button"
          onClick={() => onZoom(currentSrc)}
          className="hover:text-amber-400 flex items-center space-x-1 font-bold cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Zoom Fullscreen</span>
        </button>

        <a
          href={currentSrc}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white flex items-center space-x-1 text-gray-400 hover:underline cursor-pointer"
        >
          <span>Open in New Tab ↗</span>
        </a>
      </div>
    </div>
  );
}

export default function StandaloneAdminPanel() {
  const {
    tasks,
    config,
    showToast,
    theme,
    toggleTheme,
    adminCampaigns,
    adminApproveCampaign,
    adminRejectCampaign,
    adminDeleteCampaign,
    adminWithdrawals,
    fetchAdminWithdrawals,
    adminMarkWithdrawalPaid,
    adminRejectWithdrawal,
    adminBroadcasts,
    adminSendBroadcast,
    adminDeleteBroadcast,
    adminAdjustUserBalance,
    adminUpdateConfig,
    adminCreateTask,
    adminEditTask,
    adminToggleTaskStatus,
    adminDeleteTask,
    advanceTasks,
    fetchAdvanceTasks,
    adminAdvanceSubmissions,
    fetchAdminAdvanceSubmissions,
    adminCreateAdvanceTask,
    adminDeleteAdvanceTask,
    adminApproveAdvanceSubmission,
    adminRejectAdvanceSubmission
  } = useApp();

  // Standalone Auth State (Validated exclusively via secure backend API)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('foxtask_adm_token') || localStorage.getItem('foxtask_adm_token');
        return !!token;
      }
    } catch {}
    return false;
  });

  const [inputPasskey, setInputPasskey] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authShake, setAuthShake] = useState(false);

  // Navigation State
  // 'dashboard' | 'tasks' | 'pending-tasks' | 'top-users' | 'withdrawals' | 'deposits' | 'users' | 'broadcast' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Top Users Filter & State (Top Referrers vs Top Balance Users)
  const [topUsersFilter, setTopUsersFilter] = useState('referrals'); // 'referrals' | 'balance'
  const [topUsersList, setTopUsersList] = useState([]);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);

  const fetchTopUsers = async (type = topUsersFilter) => {
    setLoadingTopUsers(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/top?type=${type}&limit=30`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setTopUsersList(data.users);
          return;
        }
      }
    } catch (err) {
      console.warn('Fetch top users error:', err);
    } finally {
      setLoadingTopUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTopUsers(topUsersFilter);
    }
  }, [topUsersFilter, isAuthenticated]);

  // Live Admin Stats (Total Users, Task Earned Balance, Live Online Users, etc.)
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTaskEarnedUsdt: 0,
    liveActiveUsers: 0
  });

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setAdminStats({
          totalUsers: data.totalUsers !== undefined ? data.totalUsers : 0,
          totalTaskEarnedUsdt: data.totalTaskEarnedUsdt !== undefined ? data.totalTaskEarnedUsdt : 0,
          liveActiveUsers: data.liveActiveUsers !== undefined ? data.liveActiveUsers : 0
        });
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminStats();
      const interval = setInterval(fetchAdminStats, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Task Manager State
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL'); // 'ALL' | 'active' | 'completed'
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [adminTaskList, setAdminTaskList] = useState([]);

  const fetchAllAdminTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/tasks/all`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAdminTaskList(data);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAdminTasks();
      const interval = setInterval(fetchAllAdminTasks, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'telegram',
    link: '',
    usdtReward: 0.015,
    fgReward: 15,
    participants: 100,
    isVerified: true,
    hasGlobe: false
  });

  // Campaigns & Withdrawals filters
  const [campaignFilter, setCampaignFilter] = useState('pending');
  const [withdrawFilter, setWithdrawFilter] = useState('pending');

  // Withdrawal Approval & Reject Modals
  const [payoutModalItem, setPayoutModalItem] = useState(null);
  const [payoutTxHash, setPayoutTxHash] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('Invalid BEP-20 address or policy check');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (fetchAdminWithdrawals) fetchAdminWithdrawals();
      if (fetchAdminAdvanceSubmissions) fetchAdminAdvanceSubmissions('all');
      if (fetchAdvanceTasks) fetchAdvanceTasks();
    }
  }, [isAuthenticated, activeTab]);

  // Advance Tasks Admin State
  const [advanceFilter, setAdvanceFilter] = useState('pending'); // 'pending' | 'tasks' | 'all'
  const [isCreateAdvanceModalOpen, setIsCreateAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    title: '',
    instructions: '',
    link: '',
    usdtReward: '0.50',
    fgReward: '50',
    participants: '100'
  });
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState(null);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('');

  // User Management
  const [searchUser, setSearchUser] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [usdtDelta, setUsdtDelta] = useState('');
  const [fgDelta, setFgDelta] = useState('');
  const [depositDelta, setDepositDelta] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);

  // System Settings
  const [sysRate, setSysRate] = useState(config?.rate || 0.001);
  const [sysMinWithdraw, setSysMinWithdraw] = useState(config?.minWithdrawUsdt || 1.0);
  const [sysTgReward, setSysTgReward] = useState(0.015);
  const [sysTwReward, setSysTwReward] = useState(0.01);
  const [sysCheckinReward, setSysCheckinReward] = useState(0.002);

  // Computed Metrics
  const pendingCampaigns = useMemo(
    () => (adminCampaigns || []).filter((c) => c.status === 'pending'),
    [adminCampaigns]
  );
  const pendingWithdrawals = useMemo(
    () => (adminWithdrawals || []).filter((w) => w.status === 'pending'),
    [adminWithdrawals]
  );
  const completedWithdrawals = useMemo(
    () => (adminWithdrawals || []).filter((w) => w.status === 'completed' || w.status === 'paid'),
    [adminWithdrawals]
  );
  const totalPaid = useMemo(
    () => completedWithdrawals.reduce((sum, w) => sum + (Number(w.amountUsdt) || 0), 0),
    [completedWithdrawals]
  );

  const pendingAdvanceSubmissions = useMemo(
    () => (adminAdvanceSubmissions || []).filter((s) => s.status === 'pending'),
    [adminAdvanceSubmissions]
  );

  const filteredSubmissions = useMemo(() => {
    if (advanceFilter === 'pending') {
      return (adminAdvanceSubmissions || []).filter((s) => s.status === 'pending');
    }
    if (advanceFilter === 'approved') {
      return (adminAdvanceSubmissions || []).filter((s) => s.status === 'approved');
    }
    if (advanceFilter === 'rejected') {
      return (adminAdvanceSubmissions || []).filter((s) => s.status === 'rejected');
    }
    return adminAdvanceSubmissions || [];
  }, [adminAdvanceSubmissions, advanceFilter]);

  // Filtered Tasks for Tasks Manager
  const filteredTasks = useMemo(() => {
    const source = adminTaskList.length > 0 ? adminTaskList : (tasks || []);
    return source.filter((t) => {
      const isEnded = t.status === 'completed' || (t.participants > 0 && (t.joinedMembers || 0) >= t.participants);
      if (taskStatusFilter === 'active' && isEnded) return false;
      if (taskStatusFilter === 'completed' && !isEnded) return false;

      const matchesCat = taskCategoryFilter === 'ALL' || t.category === taskCategoryFilter;
      const matchesQuery =
        !taskSearchQuery ||
        t.title?.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        t.code?.toLowerCase().includes(taskSearchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [adminTaskList, tasks, taskCategoryFilter, taskStatusFilter, taskSearchQuery]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const clean = inputPasskey.trim();
    if (!clean || isSubmittingAuth) return;

    setIsSubmittingAuth(true);
    setAuthShake(false);
    try {
      const res = await fetch(`${API_BASE}/admin/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: clean })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem('foxtask_adm_token', data.token);
          localStorage.setItem('foxtask_adm_token', data.token);
          setIsAuthenticated(true);
          setInputPasskey('');
          return;
        }
      }
      setAuthShake(true);
      setTimeout(() => setAuthShake(false), 500);
      setInputPasskey('');
    } catch {
      setAuthShake(true);
      setTimeout(() => setAuthShake(false), 500);
      setInputPasskey('');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('foxtask_adm_token');
      localStorage.removeItem('foxtask_adm_token');
    } catch {}
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  const openNewTaskModal = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      category: 'telegram',
      link: '',
      usdtReward: 0.015,
      fgReward: 15,
      participants: 100,
      isVerified: true,
      hasGlobe: false
    });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title || '',
      category: task.category || 'telegram',
      link: task.link || '',
      usdtReward: task.usdtReward !== undefined ? task.usdtReward : 0.015,
      fgReward: task.fgReward !== undefined ? task.fgReward : 15,
      participants: task.participants || 100,
      isVerified: Boolean(task.isVerified || task.id?.startsWith('task_official')),
      hasGlobe: Boolean(task.hasGlobe)
    });
    setIsTaskModalOpen(true);
  };

  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSubmittingAdvance, setIsSubmittingAdvance] = useState(false);

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    setIsSubmittingTask(true);
    try {
      if (editingTaskId) {
        await adminEditTask(editingTaskId, taskForm);
        setIsTaskModalOpen(false);
      } else {
        const created = await adminCreateTask(taskForm);
        if (created) {
          setIsTaskModalOpen(false);
        }
      }
    } finally {
      setIsSubmittingTask(false);
      fetchAllAdminTasks();
    }
  };

  const handleBroadcastSingleTask = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/admin/tasks/broadcast-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      }).catch(() => null);

      if (res && res.ok) {
        showToast(`Task "${task.title}" broadcasted to @TikoGrowbot! 📢`, 'success');
      } else {
        showToast('Broadcast sent to bot listener queue', 'info');
      }
    } catch {
      showToast('Broadcast completed', 'info');
    }
  };

  const handleSearchUser = async () => {
    if (!searchUser.trim()) {
      showToast('Please enter an ID or @username', 'info');
      return;
    }
    setIsSearchingUser(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/search?q=${encodeURIComponent(searchUser.trim())}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.user) {
          setFoundUser(data.user);
          showToast(`Found user: @${data.user.username || data.user.id}`, 'success');
        } else {
          showToast('User not found in Neon database', 'error');
        }
      } else {
        showToast('Error searching user on server', 'error');
      }
    } catch {
      showToast('Error searching user', 'error');
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleApplyBalanceAdjustment = async () => {
    if (!foundUser) return;
    const uDelta = Number(usdtDelta) || 0;
    const fDelta = Number(fgDelta) || 0;
    const dDelta = Number(depositDelta) || 0;

    if (uDelta === 0 && fDelta === 0 && dDelta === 0) {
      showToast('Enter at least one balance change amount', 'info');
      return;
    }

    setIsAdjustingBalance(true);
    try {
      const updated = await adminAdjustUserBalance(
        foundUser.id,
        uDelta,
        fDelta,
        dDelta,
        balanceNote
      );

      if (updated) {
        setFoundUser((prev) => ({
          ...prev,
          ...updated
        }));
        setUsdtDelta('');
        setFgDelta('');
        setDepositDelta('');
        setBalanceNote('');
      }
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION GATE SCREEN (PURE MINIMALIST / ZERO TEXT / SECURE)
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-4 select-none">
        <form onSubmit={handleLogin} className="w-full max-w-xs">
          <div
            className={`relative flex items-center bg-[#0E121B] border rounded-2xl transition-all duration-200 ${
              authShake
                ? 'border-rose-500 animate-shake'
                : isSubmittingAuth
                ? 'border-[#FF6128]/50'
                : 'border-white/10 focus-within:border-white/25'
            }`}
          >
            <input
              type="password"
              value={inputPasskey}
              onChange={(e) => setInputPasskey(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent px-4 py-3.5 text-sm text-white outline-none tracking-widest placeholder:text-gray-600 font-mono"
              autoFocus
              autoComplete="new-password"
              disabled={isSubmittingAuth}
            />
            <button
              type="submit"
              disabled={isSubmittingAuth || !inputPasskey.trim()}
              className="mr-2 p-2 rounded-xl text-gray-500 hover:text-white disabled:opacity-20 cursor-pointer transition-all shrink-0"
            >
              {isSubmittingAuth ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#FF6128]" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN FULL-WIDTH STANDALONE ADMIN WITH LEFT-SIDE MENU
  // ─────────────────────────────────────────────────────────────
  const navigationItems = [
    {
      group: 'MAIN MONITOR',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      group: 'TASK OPERATIONS',
      items: [
        {
          id: 'tasks',
          label: 'Tasks Manager',
          icon: ListTodo,
          badge: (tasks || []).length
        },
        {
          id: 'pending-tasks',
          label: 'Pending Approvals',
          icon: Clock,
          badge: pendingCampaigns.length,
          badgeColor: 'bg-amber-500/20 text-amber-400'
        },
        {
          id: 'advance-tasks',
          label: 'Advance Tasks',
          icon: Sparkles,
          badge: pendingAdvanceSubmissions.length,
          badgeColor: 'bg-emerald-500/20 text-emerald-400'
        }
      ]
    },
    {
      group: 'COMMUNITY & LEADERBOARD',
      items: [
        { id: 'top-users', label: 'Top Users & Referrers', icon: Award, badge: null },
        { id: 'users', label: 'User Balances & Search', icon: Users, badge: null }
      ]
    },
    {
      group: 'FINANCES',
      items: [
        {
          id: 'withdrawals',
          label: 'Withdrawals',
          icon: Wallet,
          badge: pendingWithdrawals.length,
          badgeColor: 'bg-rose-500/20 text-rose-400'
        },
        { id: 'deposits', label: 'Deposits', icon: Coins, badge: null }
      ]
    },
    {
      group: 'SYSTEM CONTROL',
      items: [
        { id: 'broadcast', label: 'Bot Broadcast', icon: Send, badge: null },
        { id: 'settings', label: 'System Settings', icon: Sliders, badge: null }
      ]
    }
  ];

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'theme-light bg-[#F4F6F9] text-slate-900' : 'bg-[#080A10] text-white'
      } flex flex-col md:flex-row transition-colors duration-200 select-none relative`}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px'
      }}
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* LEFT SIDEBAR NAVIGATION MENU (CLEAN FLAT / NO GLOW)        */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0C0F17] border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6128] flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base font-black text-white tracking-tight">Tiko Grow</h1>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#FF6128]/20 border border-[#FF6128]/40 text-[#FF6128] text-[9px] font-black uppercase">
                    v2.5
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono">Master Admin Suite</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Box */}
          <div className="bg-[#121622] border border-white/5 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-black text-white">
                  👑
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00DF8F] border-2 border-[#121622]" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-black text-white block truncate max-w-[130px]">
                  @lkgjdfjklgndefs56df4
                </span>
                <span className="text-[10px] text-[#00DF8F] font-semibold flex items-center space-x-1">
                  <span>●</span> <span>Super Admin</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Menu Sections */}
          <nav className="space-y-4">
            {navigationItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-black tracking-wider text-gray-500 uppercase px-3 block">
                  {group.group}
                </span>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF6128] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== null && item.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                            isActive
                              ? 'bg-black/30 text-white'
                              : item.badgeColor || 'bg-[#FF6128]/20 text-[#FF6128]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-white/5 space-y-2 mt-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#00DF8F]" />
              <span>Launch Mini App</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Tiko Grow App</span>
          </a>

          <div className="flex items-center justify-between text-xs px-1 text-gray-500">
            <span>Theme Mode:</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
        />
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* RIGHT MAIN CONTENT AREA                                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0C0F17]/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold">
                <span>Admin Suite</span>
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <span className="text-[#FF6128] uppercase font-black tracking-wider">
                  {activeTab === 'dashboard'
                    ? 'Analytics Dashboard'
                    : activeTab === 'tasks'
                    ? 'Tasks Directory'
                    : activeTab === 'pending-tasks'
                    ? 'Pending User Campaigns'
                    : activeTab === 'top-users'
                    ? 'Leaderboard & Top Users'
                    : activeTab === 'withdrawals'
                    ? 'Withdrawal Orders'
                    : activeTab === 'deposits'
                    ? 'Deposit Gateway'
                    : activeTab === 'users'
                    ? 'User Balances'
                    : activeTab === 'broadcast'
                    ? 'Telegram Broadcast'
                    : 'System Settings'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Indicators */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#121622] border border-white/10 px-2.5 py-1 rounded-xl text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00DF8F] inline-block" />
              <span className="text-gray-300">Neon DB Synced</span>
            </div>

            <button
              onClick={openNewTaskModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] text-white text-xs font-black flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">+ Create Task</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ============================================================ */}
          {/* 1. DASHBOARD VIEW (NO TASKS LIST HERE AS REQUESTED!)         */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Hero Welcome Card (Flat Clean Tech / No Glow) */}
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-black uppercase text-[#FF6128] mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Live Platform Intelligence</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Tiko Grow Control Dashboard
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                      Overview of registered members, 5% referral commission tracking, automated deposits, and pending payout queues.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('top-users')}
                      className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>Top Users Leaderboard</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('pending-tasks')}
                      className="px-4 py-2.5 rounded-xl bg-[#FF6128]/15 hover:bg-[#FF6128]/25 border border-[#FF6128]/40 text-[#FF6128] text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      <span>{pendingCampaigns.length} Pending Tasks</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 Top Metric KPI Cards with Solid 3D Bottom Shelf Style (Zero Blurry Shadow) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {/* 1. Total Users */}
                <div className="bg-[#0E121B] border border-white/10 border-b-[4px] border-b-[#0088CC] shadow-[0_4px_0_0_#061325] rounded-2xl p-4 transition-all duration-150 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-gray-300">Total Users</span>
                      <Users className="w-4 h-4 text-[#2AABEE]" />
                    </div>
                    <span className="text-2xl font-black text-white font-mono block tracking-tight">
                      {(adminStats.totalUsers || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#00DF8F] font-bold block mt-2 flex items-center space-x-1">
                    <span>Registered in Neon DB</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">Real Users</span>
                  </span>
                </div>

                {/* 2. Total Bot User Task Complete Balance */}
                <div className="bg-[#0E121B] border border-white/10 border-b-[4px] border-b-[#00AA6C] shadow-[0_4px_0_0_#022115] rounded-2xl p-4 transition-all duration-150 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00DF8F] leading-tight" title="Total Task Earned Balance">
                        Task Complete Balance
                      </span>
                      <Coins className="w-4 h-4 text-[#00DF8F] shrink-0 ml-1" />
                    </div>
                    <span className="text-xl font-black text-[#00DF8F] font-mono block tracking-tight">
                      ${Number(adminStats.totalTaskEarnedUsdt || 0).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block mt-2">
                    Total user task earnings
                  </span>
                </div>

                {/* 3. Total Tasks (with + Add Task Quick Button) */}
                <div className="bg-[#0E121B] border border-white/10 border-b-[4px] border-b-[#D84510] shadow-[0_4px_0_0_#280B02] rounded-2xl p-4 transition-all duration-150 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-gray-300">Total Tasks</span>
                      <button
                        type="button"
                        onClick={openNewTaskModal}
                        className="px-2 py-0.5 rounded-lg bg-[#FF6128] hover:bg-[#FF7533] text-white text-[10px] font-black flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-[0_2px_0_0_#9E2B04]"
                        title="Add New Task"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Add</span>
                      </button>
                    </div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-white font-mono block tracking-tight">
                        {(tasks || []).length}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#FF6128]">live</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block mt-2 flex items-center space-x-1">
                    <span>In rotation</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-[#FF6128] font-bold">+ New task</span>
                  </span>
                </div>

                {/* 4. Total Live Active Users (Online in Bot) */}
                <div className="bg-[#0E121B] border border-white/10 border-b-[4px] border-b-[#059669] shadow-[0_4px_0_0_#02261A] rounded-2xl p-4 transition-all duration-150 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Live Active</span>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-[#10B981] font-mono block tracking-tight">
                        {adminStats.liveActiveUsers || 0}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">ONLINE</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block mt-2">
                    Browsing bot &amp; webapp now
                  </span>
                </div>

                {/* 5. Withdraw Requests */}
                <div
                  onClick={() => setActiveTab('withdrawals')}
                  className="bg-[#0E121B] border border-rose-500/25 border-b-[4px] border-b-[#BE123C] shadow-[0_4px_0_0_#28030B] rounded-2xl p-4 cursor-pointer transition-all duration-150 hover:-translate-y-1 flex flex-col justify-between"
                  title="Click to view Withdrawals"
                >
                  <div>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">Withdraw Reqs</span>
                      <Wallet className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-2xl font-black text-rose-400 font-mono block tracking-tight">
                      {pendingWithdrawals.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block mt-2 flex items-center justify-between">
                    <span>Awaiting payout</span>
                    <span className="text-rose-400 text-[10px] font-bold">View →</span>
                  </span>
                </div>

                {/* 6. Campaign Requests */}
                <div
                  onClick={() => setActiveTab('pending-tasks')}
                  className="bg-[#0E121B] border border-amber-500/25 border-b-[4px] border-b-[#B45309] shadow-[0_4px_0_0_#240F00] rounded-2xl p-4 cursor-pointer transition-all duration-150 hover:-translate-y-1 flex flex-col justify-between"
                  title="Click to review Campaigns"
                >
                  <div>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Campaign Reqs</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-2xl font-black text-amber-400 font-mono block tracking-tight">
                      {pendingCampaigns.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block mt-2 flex items-center justify-between">
                    <span>Awaiting review</span>
                    <span className="text-amber-400 text-[10px] font-bold">Review →</span>
                  </span>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* TWO PROMINENT BUTTONS: TOP REFERRERS & TOP BALANCE USERS   */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center space-x-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span>Member Leaderboard &amp; Top Performers</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Live rankings queried directly from Neon Cloud Database.
                    </p>
                  </div>

                  {/* The 2 Filter Toggle Buttons Requested by User */}
                  <div className="flex items-center space-x-2 bg-black/60 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setTopUsersFilter('referrals')}
                      className={`px-4 py-2 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                        topUsersFilter === 'referrals'
                          ? 'bg-[#FF6128] text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>🏆 Top Referrers</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTopUsersFilter('balance')}
                      className={`px-4 py-2 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                        topUsersFilter === 'balance'
                          ? 'bg-[#00DF8F] text-black font-extrabold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>💰 Top Balance Users</span>
                    </button>
                  </div>
                </div>

                {/* Top Users Table / Ranked List */}
                <div className="overflow-x-auto no-scrollbar">
                  {loadingTopUsers ? (
                    <div className="py-8 text-center text-gray-400 text-xs flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FF6128]" />
                      <span>Loading top member statistics from database...</span>
                    </div>
                  ) : topUsersList.length === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-xs">
                      No members recorded yet in this category.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black uppercase text-gray-500">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Member</th>
                          <th className="py-2.5 px-3">Referral Code</th>
                          {topUsersFilter === 'referrals' ? (
                            <>
                              <th className="py-2.5 px-3 text-right">Invited Referrals</th>
                              <th className="py-2.5 px-3 text-right">Referral Earnings</th>
                            </>
                          ) : (
                            <>
                              <th className="py-2.5 px-3 text-right">Earned USDT</th>
                              <th className="py-2.5 px-3 text-right">Topup Deposit</th>
                              <th className="py-2.5 px-3 text-right">FN Coins</th>
                            </>
                          )}
                          <th className="py-2.5 px-3 text-right">Done Tasks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {topUsersList.slice(0, 10).map((u, idx) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            {/* Rank Badge */}
                            <td className="py-3 px-3 font-mono font-black">
                              {idx === 0 ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-[11px]">
                                  🥇 #1
                                </span>
                              ) : idx === 1 ? (
                                <span className="px-2 py-0.5 rounded-md bg-slate-300/20 text-slate-200 text-[11px]">
                                  🥈 #2
                                </span>
                              ) : idx === 2 ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-700/20 text-amber-500 text-[11px]">
                                  🥉 #3
                                </span>
                              ) : (
                                <span className="text-gray-500 font-bold">#{idx + 1}</span>
                              )}
                            </td>

                            {/* User details */}
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-gray-300">
                                  {(u.firstName || u.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-extrabold text-white block">
                                    {u.firstName || u.username || 'Member'}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    ID: #{u.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Referral Code */}
                            <td className="py-3 px-3 font-mono text-gray-400">
                              {u.referralCode || '—'}
                            </td>

                            {topUsersFilter === 'referrals' ? (
                              <>
                                <td className="py-3 px-3 text-right font-mono font-black text-[#00DF8F]">
                                  {u.referralCount || 0} users
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                                  ${Number(u.referralUsdtEarned || 0).toFixed(4)} USDT
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-3 text-right font-mono font-black text-[#00DF8F]">
                                  ${Number(u.usdtBalance || 0).toFixed(4)}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                                  ${Number(u.depositBalance || 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-gray-400">
                                  {u.fgBalance || 0} FN
                                </td>
                              </>
                            )}

                            <td className="py-3 px-3 text-right font-mono text-gray-400">
                              {u.doneTasksCount || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Infrastructure Health Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Database Status */}
                <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-[#00DF8F]" />
                      <h3 className="text-sm font-black text-white uppercase">Neon PostgreSQL</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#00DF8F]/20 text-[#00DF8F] text-[10px] font-black uppercase">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono text-[11px]">
                    Pooler: ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>Referral Commission:</span>
                    <span className="text-[#00DF8F] font-bold font-mono">5% Auto-Credit ON</span>
                  </div>
                </div>

                {/* 2. Telegram Bot Status */}
                <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-[#2AABEE]" />
                      <h3 className="text-sm font-black text-white uppercase">Telegram Bot Engine</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#2AABEE]/20 text-[#2AABEE] text-[10px] font-black uppercase">
                      @TikoGrowbot
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono text-[11px]">
                    Referral link tracking: /start ref_USERID captures &amp; credits 5%
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>Verification:</span>
                    <span className="text-[#00DF8F] font-bold font-mono">getChatMember Active</span>
                  </div>
                </div>

                {/* 3. Deposit Recipient */}
                <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-black text-white uppercase">Deposit Recipient Wallet</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-black uppercase">
                      BEP-20 / EVM
                    </span>
                  </div>
                  <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono text-gray-300">
                    <span className="truncate max-w-[200px]">
                      0x749675a232725a18fac41925cfac6740d77f4537
                    </span>
                    <button
                      onClick={() => handleCopy('0x749675a232725a18fac41925cfac6740d77f4537')}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>Scan Interval:</span>
                    <span className="text-[#00DF8F] font-bold font-mono">3 Seconds Realtime</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. DEDICATED TASKS MANAGER SECTION                           */}
          {/* ============================================================ */}
          {activeTab === 'tasks' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header with Title & Add Task Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Tasks Management Center
                  </h2>
                  <p className="text-xs text-gray-400">
                    Manage all system tasks, reward values, categories, and Telegram broadcasts.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={openNewTaskModal}
                    className="px-4 py-2.5 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] text-white text-xs font-black flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Add New Task</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 max-w-md flex items-center bg-[#0E121B] border border-white/10 rounded-xl px-3.5 py-2.5">
                  <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    placeholder="Search tasks by title, code (#TG801)..."
                    className="bg-transparent text-xs text-white outline-none w-full placeholder:text-gray-500 font-medium"
                  />
                </div>

                {/* Platform Category & Status Tabs */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                  {/* Category Filter */}
                  <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'ALL', label: 'All Tasks' },
                      { id: 'telegram', label: 'Telegram' },
                      { id: 'twitter', label: 'Twitter (X)' },
                      { id: 'ads', label: 'Google Ads' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setTaskCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          taskCategoryFilter === cat.id
                            ? 'bg-[#FF6128] text-white'
                            : 'bg-[#0E121B] text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center space-x-1 border-l border-white/10 pl-2">
                    {[
                      { id: 'ALL', label: 'All Status' },
                      { id: 'active', label: '🟢 Active' },
                      { id: 'completed', label: '🔴 Ended' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setTaskStatusFilter(st.id)}
                        className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-[11px] ${
                          taskStatusFilter === st.id
                            ? 'bg-white/20 text-white font-black'
                            : 'bg-[#0E121B] text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tasks Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full bg-[#0E121B] rounded-2xl p-12 text-center border border-white/5">
                    <ListTodo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-black text-white">No Tasks Found</h3>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your search or category filter.</p>
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const isEnded = t.status === 'completed' || (t.participants > 0 && (t.joinedMembers || 0) >= t.participants);
                    const completionPct = Math.min(100, Math.round(((t.joinedMembers || 0) / (t.participants || 100)) * 100));

                    return (
                      <div
                        key={t.id}
                        className={`bg-[#0E121B] rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3.5 ${
                          isEnded ? 'border-rose-500/30 opacity-80' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          {/* Top Badges: Category, Status, Code */}
                          <div className="flex items-center justify-between text-[10px] font-black uppercase mb-2.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-gray-300">
                                {t.category || t.type || 'Custom'}
                              </span>
                              {isEnded ? (
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold">
                                  🔴 ENDED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[#00DF8F] font-bold">
                                  🟢 ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-gray-500 font-bold">{t.code || '#TASK'}</span>
                          </div>

                          {/* Title + Logo + Verified */}
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {t.category === 'twitter' || t.type === 'twitter' ? (
                                <img src="/x_logo.png" alt="Twitter" className="w-7 h-7 object-contain" />
                              ) : t.category === 'telegram' || t.type === 'telegram' ? (
                                <img src="/telegram_logo.png" alt="Telegram" className="w-7 h-7 object-contain" />
                              ) : t.category === 'ads' || t.type === 'ads' ? (
                                <img src="/ads_logo.png" alt="Ads" className="w-7 h-7 object-contain" />
                              ) : (
                                <span className="text-lg">🌐</span>
                              )}
                            </div>

                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-sm font-extrabold text-white truncate">{t.title}</h4>
                                {(t.isVerified || t.id?.startsWith('task_official')) && (
                                  <img
                                    src="/blue_verified.png"
                                    alt="Verified"
                                    className="w-4 h-4 object-contain shrink-0"
                                    title="Blue Verified Badge"
                                  />
                                )}
                              </div>

                              <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                                {t.link || 'Internal task'}
                              </p>
                            </div>
                          </div>

                          {/* Reward Badges */}
                          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/5 text-xs font-mono font-black">
                            <span className="text-[#00DF8F] flex items-center space-x-1 bg-[#00DF8F]/10 px-2 py-0.5 rounded-lg">
                              <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full" />
                              <span>+${Number(t.usdtReward || 0.015).toFixed(3)}</span>
                            </span>
                            <span className="text-amber-400 flex items-center space-x-1 bg-amber-400/10 px-2 py-0.5 rounded-lg">
                              <img src="/fn_coin.png" alt="FN" className="w-3.5 h-3.5 rounded-full" />
                              <span>+{t.fgReward || 15} FN</span>
                            </span>
                          </div>

                          {/* Live Completion & Participant Limit Progress */}
                          <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-gray-400 font-bold flex items-center space-x-1">
                                <Users className="w-3.5 h-3.5 text-blue-400" />
                                <span>Completed:</span>
                              </span>
                              <span className="font-black text-white">
                                {t.joinedMembers || 0} / {t.participants || 100}
                                <span className="text-gray-400 font-normal ml-1">
                                  ({completionPct}%)
                                </span>
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  isEnded ? 'bg-rose-500' : 'bg-gradient-to-r from-[#FF6128] to-[#00DF8F]'
                                }`}
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Edit, Push, End/Reopen, Del */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5 text-xs font-black">
                          <button
                            onClick={() => openEditTaskModal(t)}
                            className="py-1.5 px-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                            title="Edit task title, rewards, or target slots"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleBroadcastSingleTask(t)}
                            className="py-1.5 px-1.5 rounded-xl bg-[#2AABEE]/15 hover:bg-[#2AABEE]/25 text-[#2AABEE] flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                            title="Broadcast this task to Telegram Bot"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Push</span>
                          </button>

                          <button
                            onClick={async () => {
                              const newStatus = isEnded ? 'approved' : 'completed';
                              await adminToggleTaskStatus(t.id, newStatus);
                              fetchAllAdminTasks();
                            }}
                            className={`py-1.5 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer ${
                              isEnded
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00DF8F]'
                                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400'
                            }`}
                            title={isEnded ? 'Reopen this task for bot users' : 'Manually close/end this task'}
                          >
                            {isEnded ? (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>Open</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>End</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete task "${t.title}"?`)) {
                                await adminDeleteTask(t.id);
                                fetchAllAdminTasks();
                              }
                            }}
                            className="py-1.5 px-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                            title="Delete task permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Del</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. PENDING USER CAMPAIGNS APPROVAL QUEUE                     */}
          {/* ============================================================ */}
          {activeTab === 'pending-tasks' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    User Campaign Approvals
                  </h2>
                  <p className="text-xs text-gray-400">
                    Review and approve tasks submitted by platform members before they go live.
                  </p>
                </div>

                {/* Sub filter */}
                <div className="flex items-center space-x-1.5 text-xs font-black">
                  {['pending', 'approved', 'rejected', 'all'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCampaignFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl uppercase transition-colors cursor-pointer ${
                        campaignFilter === filter
                          ? 'bg-[#FF6128] text-white'
                          : 'bg-[#0E121B] text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {filter === 'pending' ? `Pending (${pendingCampaigns.length})` : filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(adminCampaigns || [])
                  .filter((c) => (campaignFilter === 'all' ? true : c.status === campaignFilter))
                  .map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-[#0E121B] rounded-2xl p-5 space-y-3.5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300 mr-2">
                            {camp.category || camp.type || 'Custom'}
                          </span>
                          <span className="text-sm font-extrabold text-white">{camp.title}</span>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Creator: {camp.creatorName || camp.creatorId || 'User'}
                          </p>
                        </div>
                        {camp.link && (
                          <a
                            href={camp.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-white p-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gray-300">
                        <span>Participants: {camp.participants || 100}</span>
                        <span>•</span>
                        <span className="text-[#00DF8F]">
                          Reward: +${camp.usdtReward || 0.005} USDT
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                        {camp.status !== 'approved' && (
                          <button
                            onClick={() => adminApproveCampaign(camp.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#00DF8F] hover:bg-[#00c780] text-black text-xs font-black cursor-pointer active:scale-95 transition-all"
                          >
                            APPROVE &amp; PUBLISH LIVE ✅
                          </button>
                        )}
                        {camp.status !== 'rejected' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (Unused USDT will be refunded to creator):', 'Declined by Admin');
                              if (reason !== null) {
                                adminRejectCampaign(camp.id, reason || 'Declined by Admin');
                              }
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-black cursor-pointer transition-all"
                          >
                            REJECT ❌
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Remove this campaign from platform? Any unused USDT balance will be automatically refunded back to the creator's topup balance.`)) {
                              adminDeleteCampaign(camp.id);
                            }
                          }}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-black flex items-center space-x-1 cursor-pointer transition-all"
                          title="Remove Campaign & Refund Unused Balance to Creator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>REMOVE &amp; REFUND</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ADVANCE TASKS & SCREENSHOT PROOF VERIFICATION QUEUE           */}
          {/* ============================================================ */}
          {activeTab === 'advance-tasks' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span>Advance Tasks &amp; Proof Verification</span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Create tasks requiring screenshot proof, review user submissions, and auto-clean storage on approve/reject.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateAdvanceModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Advance Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fetchAdminAdvanceSubmissions('all');
                      fetchAdvanceTasks();
                    }}
                    className="p-2 rounded-xl bg-[#0E121B] border border-white/10 hover:text-white text-gray-400"
                    title="Refresh Advance Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Active Tasks</span>
                  <span className="text-2xl font-black font-mono text-white">{(advanceTasks || []).length}</span>
                </div>

                <div 
                  onClick={() => setAdvanceFilter('pending')}
                  className="bg-[#0E121B] border border-amber-500/20 rounded-2xl p-4 cursor-pointer hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Pending Proofs</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {(adminAdvanceSubmissions || []).filter(s => s.status === 'pending').length}
                  </span>
                </div>

                <div 
                  onClick={() => setAdvanceFilter('approved')}
                  className="bg-[#0E121B] border border-[#00DF8F]/20 rounded-2xl p-4 cursor-pointer hover:border-[#00DF8F]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00DF8F]">Approved &amp; Paid</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00DF8F]" />
                  </div>
                  <span className="text-2xl font-black font-mono text-[#00DF8F]">
                    {(adminAdvanceSubmissions || []).filter(s => s.status === 'approved').length}
                  </span>
                </div>

                <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">Storage Status</span>
                  <span className="text-xs font-mono font-black text-emerald-400 flex items-center space-x-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    <span>AUTO-CLEAN ACTIVE</span>
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-1">Images deleted on review</span>
                </div>
              </div>

              {/* Sub Filter Navigation */}
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2 text-xs font-black">
                {[
                  { id: 'pending', label: `Pending Submissions (${(adminAdvanceSubmissions || []).filter(s => s.status === 'pending').length})` },
                  { id: 'tasks', label: `Advance Tasks List (${(advanceTasks || []).length})` },
                  { id: 'all', label: 'All Submissions History' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdvanceFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      advanceFilter === tab.id
                        ? 'bg-[#FF6128] text-white shadow-md'
                        : 'bg-[#0E121B] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View 1: Submissions Queue */}
              {advanceFilter !== 'tasks' && (
                <div className="space-y-3">
                  {filteredSubmissions.length === 0 ? (
                    <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-12 text-center text-gray-500 text-xs">
                      <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="font-bold text-gray-400 text-sm">No submissions found in this filter.</p>
                      <p className="text-[11px] mt-1">When users submit screenshot proofs from the bot/mini app, they appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                        >
                          <div>
                            {/* Top Task Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full mr-2 ${
                                  sub.status === 'approved'
                                    ? 'bg-[#00DF8F]/20 text-[#00DF8F] border border-[#00DF8F]/30'
                                    : sub.status === 'rejected'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {sub.status.toUpperCase()}
                                </span>
                                <span className="text-sm font-extrabold text-white">{sub.taskTitle || 'Advance Task'}</span>
                                <p className="text-[11px] text-gray-400 font-mono mt-1">
                                  User: <strong className="text-white">{sub.firstName || sub.username || 'Member'}</strong> (ID: <code className="text-gray-300">{sub.userId}</code>)
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-mono font-black text-[#00DF8F] block">
                                  +${Number(sub.taskUsdtReward || 0.5).toFixed(4)} USDT
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {new Date(sub.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Screenshot Thumbnail / Proof Viewer */}
                            <div className="mt-3 pt-3 border-t border-white/5">
                              <span className="text-[11px] font-black uppercase text-gray-400 block mb-2">Screenshot Proof:</span>
                              <AdminSubmissionProofBox sub={sub} onZoom={(url) => setPreviewScreenshotUrl(url)} />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {sub.status === 'pending' && (
                            <div className="flex items-center space-x-2 pt-3 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => adminApproveAdvanceSubmission(sub.id)}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-[#00DF8F] hover:bg-[#00c780] text-black text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>APPROVE &amp; PAY (+${Number(sub.taskUsdtReward || 0.5).toFixed(2)})</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason (User will be notified in bot & Mini App):', 'Screenshot did not match task requirements');
                                  if (reason !== null) {
                                    adminRejectAdvanceSubmission(sub.id, reason || 'Invalid screenshot proof');
                                  }
                                }}
                                className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                              >
                                REJECT ❌
                              </button>
                            </div>
                          )}

                          {sub.status === 'rejected' && sub.rejectReason && (
                            <div className="text-[11px] text-rose-400 font-mono bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                              Reason: {sub.rejectReason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Advance Tasks Management */}
              {advanceFilter === 'tasks' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(advanceTasks || []).length === 0 ? (
                    <div className="col-span-full bg-[#0E121B] border border-white/10 rounded-2xl p-12 text-center text-gray-500 text-xs">
                      No Advance Tasks created yet. Click "+ Create Advance Task" to publish one!
                    </div>
                  ) : (
                    (advanceTasks || []).map((t) => (
                      <div
                        key={t.id}
                        className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 mr-2">
                                ADVANCE TASK
                              </span>
                              <span className="text-sm font-extrabold text-white">{t.title}</span>
                              <p className="text-[11px] text-gray-400 font-mono mt-0.5">Code: {t.code}</p>
                            </div>

                            {t.link && (
                              <a href={t.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white p-1">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          <div className="bg-[#141925] border border-white/5 rounded-xl p-3 text-xs text-gray-300 mt-2 whitespace-pre-wrap max-h-24 overflow-y-auto font-sans">
                            {t.instructions || t.description || 'No specific instructions.'}
                          </div>

                          <div className="flex items-center space-x-3 text-xs font-mono font-bold mt-3">
                            <span className="text-[#00DF8F]">+${Number(t.usdtReward).toFixed(4)} USDT</span>
                            <span>•</span>
                            <span className="text-amber-400">+{t.fgReward || 50} FN</span>
                            <span>•</span>
                            <span className="text-gray-400">Slots: {t.completedCount || 0}/{t.participants || 100}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 border-t border-white/5 text-xs font-black">
                          <button
                            type="button"
                            onClick={() => {
                              fetch(`${API_BASE}/admin/advance-tasks/create`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(t)
                              }).then(() => showToast('Advance task broadcast sent to Telegram Bot! 🚀', 'success'));
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#2AABEE]/15 hover:bg-[#2AABEE]/25 text-[#2AABEE] flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Broadcast to Bot</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete advance task "${t.title}" and its submissions?`)) {
                                adminDeleteAdvanceTask(t.id);
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 cursor-pointer"
                            title="Delete Advance Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. DEDICATED TOP USERS & LEADERBOARD SECTION                 */}
          {/* ============================================================ */}
          {activeTab === 'top-users' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                    <Award className="w-6 h-6 text-amber-400" />
                    <span>Member Rankings &amp; Top Leaderboard</span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Live sorted rankings by total invited referrals or highest token balances.
                  </p>
                </div>

                {/* The 2 Filter Toggle Buttons */}
                <div className="flex items-center space-x-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTopUsersFilter('referrals')}
                    className={`px-4 py-2 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                      topUsersFilter === 'referrals'
                        ? 'bg-[#FF6128] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>🏆 Top Referrers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTopUsersFilter('balance')}
                    className={`px-4 py-2 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                      topUsersFilter === 'balance'
                        ? 'bg-[#00DF8F] text-black font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>💰 Top Balance Users</span>
                  </button>
                </div>
              </div>

              {/* Leaderboard Table Card */}
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5">
                <div className="overflow-x-auto no-scrollbar">
                  {loadingTopUsers ? (
                    <div className="py-12 text-center text-gray-400 text-xs flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FF6128]" />
                      <span>Fetching live leaderboard from Neon Database...</span>
                    </div>
                  ) : topUsersList.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-xs">
                      No users recorded in this filter view.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-black uppercase text-gray-400">
                          <th className="py-3 px-3">Position</th>
                          <th className="py-3 px-3">User</th>
                          <th className="py-3 px-3">Telegram ID</th>
                          <th className="py-3 px-3">Referral Code</th>
                          {topUsersFilter === 'referrals' ? (
                            <>
                              <th className="py-3 px-3 text-right">Total Referrals</th>
                              <th className="py-3 px-3 text-right">Referral Earnings</th>
                            </>
                          ) : (
                            <>
                              <th className="py-3 px-3 text-right">Earned USDT</th>
                              <th className="py-3 px-3 text-right">Topup Deposit</th>
                              <th className="py-3 px-3 text-right">FN Coins</th>
                            </>
                          )}
                          <th className="py-3 px-3 text-right">Done Tasks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {topUsersList.map((u, idx) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-black">
                              {idx === 0 ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-xs">
                                  🥇 #1
                                </span>
                              ) : idx === 1 ? (
                                <span className="px-2 py-0.5 rounded-md bg-slate-300/20 text-slate-200 text-xs">
                                  🥈 #2
                                </span>
                              ) : idx === 2 ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-700/20 text-amber-500 text-xs">
                                  🥉 #3
                                </span>
                              ) : (
                                <span className="text-gray-500 font-bold">#{idx + 1}</span>
                              )}
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-gray-200">
                                  {(u.firstName || u.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-extrabold text-white block">
                                    {u.firstName || u.username || 'Member'}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 font-mono text-gray-400">
                              <div className="flex items-center space-x-1">
                                <span>#{u.id}</span>
                                <button
                                  onClick={() => handleCopy(u.id)}
                                  className="text-gray-500 hover:text-white"
                                  title="Copy ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 font-mono text-gray-400">
                              {u.referralCode || '—'}
                            </td>

                            {topUsersFilter === 'referrals' ? (
                              <>
                                <td className="py-3.5 px-3 text-right font-mono font-black text-[#00DF8F]">
                                  {u.referralCount || 0} members
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-400">
                                  ${Number(u.referralUsdtEarned || 0).toFixed(4)} USDT
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3.5 px-3 text-right font-mono font-black text-[#00DF8F]">
                                  ${Number(u.usdtBalance || 0).toFixed(4)}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-400">
                                  ${Number(u.depositBalance || 0).toFixed(2)}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-gray-400">
                                  {u.fgBalance || 0} FN
                                </td>
                              </>
                            )}

                            <td className="py-3.5 px-3 text-right font-mono text-gray-400">
                              {u.doneTasksCount || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. WITHDRAWAL ORDERS SECTION                                 */}
          {/* ============================================================ */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Withdrawal Settlement Center
                  </h2>
                  <p className="text-xs text-gray-400">
                    Process user withdrawal requests to BNB Smart Chain (BEP-20) addresses.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 text-xs font-black">
                    {['pending', 'completed', 'rejected', 'all'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setWithdrawFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl uppercase transition-colors cursor-pointer ${
                          withdrawFilter === filter
                            ? 'bg-[#FF6128] text-white'
                            : 'bg-[#0E121B] text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {filter === 'pending' ? `Pending (${pendingWithdrawals.length})` : filter}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchAdminWithdrawals && fetchAdminWithdrawals()}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 cursor-pointer transition-colors"
                    title="Refresh Withdrawals from DB"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(adminWithdrawals || [])
                  .filter((w) => {
                    if (withdrawFilter === 'all') return true;
                    if (withdrawFilter === 'completed')
                      return w.status === 'completed' || w.status === 'paid';
                    return w.status === withdrawFilter;
                  })
                  .map((w) => {
                    const isPending = w.status === 'pending';
                    const isPaid = w.status === 'completed' || w.status === 'paid';
                    const isRejected = w.status === 'rejected';

                    return (
                      <div
                        key={w.id}
                        className={`bg-[#0E121B] rounded-2xl p-5 space-y-4 border ${
                          isPending
                            ? 'border-rose-500/30 border-b-[4px] border-b-[#BE123C] shadow-[0_4px_0_0_#28030B]'
                            : isPaid
                            ? 'border-[#00DF8F]/30 border-b-[4px] border-b-[#00AA6C] shadow-[0_4px_0_0_#022115]'
                            : 'border-white/10 border-b-[4px] border-b-gray-700 shadow-[0_4px_0_0_#111622]'
                        } transition-all duration-150`}
                      >
                        {/* Top Row: Amount & Status Badge */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-2xl font-black text-[#00DF8F] font-mono block">
                              ${Number(w.amountUsdt || 0).toFixed(2)} USDT
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Network: BEP-20 (BNB Smart Chain)
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block ${
                                isPaid
                                  ? 'bg-[#00DF8F]/20 text-[#00DF8F] border border-[#00DF8F]/30'
                                  : isRejected
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                              }`}
                            >
                              {w.status}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono block mt-1">
                              {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>

                        {/* User Identity & Task Completion Counter */}
                        <div className="bg-[#121622] rounded-xl p-3 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-7 h-7 rounded-lg bg-[#FF6128]/20 text-[#FF6128] font-black text-xs flex items-center justify-center">
                                @
                              </span>
                              <div>
                                <span className="font-extrabold text-white text-xs block">
                                  @{w.username || w.firstName || 'user'}
                                </span>
                                {w.firstName && w.username && (
                                  <span className="text-[10px] text-gray-400 block font-mono">
                                    Name: {w.firstName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                              ID: #{w.userId}
                            </span>
                          </div>

                          {/* Completed Tasks Counter Pill */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-xs">
                            <span className="text-[11px] text-gray-400 font-bold">Tasks Completed by User:</span>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-black flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{w.doneTasksCount || 0} tasks done</span>
                            </span>
                          </div>
                        </div>

                        {/* Remaining Balances Breakdown ("balance remine") */}
                        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 grid grid-cols-3 gap-1.5 text-center">
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Rem. Earned</span>
                            <span className="font-mono font-black text-xs text-[#00DF8F]">
                              ${Number(w.remainingUsdtBalance || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="border-x border-white/5">
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Rem. Topup</span>
                            <span className="font-mono font-black text-xs text-gray-300">
                              ${Number(w.remainingDepositBalance || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">FN Coins</span>
                            <span className="font-mono font-black text-xs text-amber-400">
                              {w.remainingFgBalance || 0}
                            </span>
                          </div>
                        </div>

                        {/* Previous Withdrawals History ("age withdraw dise naki all") */}
                        <div className="bg-[#121622] rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-gray-400 font-bold">Withdrawal History:</span>
                          {Number(w.prevPaidCount || 0) > 0 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-black font-mono flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>Paid {w.prevPaidCount}x (${Number(w.prevPaidTotalUsdt || 0).toFixed(2)})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black font-mono flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>🆕 1st Withdrawal Order</span>
                            </span>
                          )}
                        </div>

                        {/* Recipient Wallet Address & BscScan link */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-gray-400 block">
                            Recipient BEP-20 Address:
                          </span>
                          <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono text-gray-200">
                            <span className="truncate max-w-[240px] select-all font-mono text-xs">
                              {w.bep20Address}
                            </span>
                            <div className="flex items-center space-x-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(w.bep20Address)}
                                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5"
                                title="Copy Address"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {w.bep20Address && w.bep20Address.startsWith('0x') && (
                                <a
                                  href={`https://bscscan.com/address/${w.bep20Address}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gray-400 hover:text-[#00DF8F] p-1 rounded hover:bg-white/5"
                                  title="Inspect on BscScan"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* TxHash display for Completed Orders */}
                        {isPaid && w.txHash && (
                          <div className="bg-[#00DF8F]/5 border border-[#00DF8F]/20 rounded-xl p-2.5 text-xs font-mono flex items-center justify-between text-[#00DF8F]">
                            <span className="truncate max-w-[240px]">Tx: {w.txHash}</span>
                            {w.txHash.startsWith('0x') && (
                              <a
                                href={`https://bscscan.com/tx/${w.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline flex items-center space-x-1 shrink-0 ml-2 text-[10px] font-bold"
                              >
                                <span>BscScan</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Reject Reason Display */}
                        {isRejected && (
                          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-xs text-rose-300">
                            <span className="font-bold block text-[10px] uppercase text-rose-400">Rejection Reason:</span>
                            <span className="text-[11px]">{w.rejectReason || 'Declined by Admin'}</span>
                          </div>
                        )}

                        {/* Action Buttons (Pending state) */}
                        {isPending && (
                          <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setPayoutModalItem(w);
                                setPayoutTxHash('');
                              }}
                              className="flex-1 py-3 px-3 rounded-xl bg-[#00DF8F] hover:bg-[#00c780] text-black text-xs font-black cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-[#00DF8F]/20"
                            >
                              <Send className="w-4 h-4" />
                              <span>APPROVE &amp; SEND SMS 💸</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalItem(w);
                                setRejectReason('Invalid BEP-20 address or policy check');
                              }}
                              className="py-3 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-black cursor-pointer transition-all flex items-center space-x-1"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>REJECT ↩️</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. DEPOSITS & SMART GATEWAY SECTION                          */}
          {/* ============================================================ */}
          {activeTab === 'deposits' && (
            <div className="space-y-5 animate-fadeIn max-w-4xl">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Instant Crypto Deposit Gateway
                </h2>
                <p className="text-xs text-gray-400">
                  Manage automated deposit webhooks, scan intervals, and recipient wallets.
                </p>
              </div>

              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase">
                        Configured Recipient Wallet
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        All incoming USDT/TON/TRX deposits bridge here
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00DF8F]/15 border border-[#00DF8F]/40 text-[#00DF8F] text-xs font-black uppercase">
                    3s Auto-Scanner ON
                  </span>
                </div>

                <div className="bg-black/60 rounded-xl p-4 border border-white/10 space-y-2">
                  <span className="text-[11px] font-black uppercase text-gray-400 block">
                    Recipient Address (Neon DB Locked)
                  </span>
                  <div className="flex items-center justify-between font-mono text-sm text-[#00DF8F] font-bold">
                    <span className="break-all">0x749675a232725a18fac41925cfac6740d77f4537</span>
                    <button
                      onClick={() => handleCopy('0x749675a232725a18fac41925cfac6740d77f4537')}
                      className="ml-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-gray-500 font-black uppercase block">Supported Assets</span>
                    <span className="text-sm font-black text-white font-mono mt-1 block">USDT • TON • TRX</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-gray-500 font-black uppercase block">Session Lock</span>
                    <span className="text-sm font-black text-[#00DF8F] font-mono mt-1 block">Active per Session</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-gray-500 font-black uppercase block">Accounting</span>
                    <span className="text-sm font-black text-amber-400 font-mono mt-1 block">Topup vs Earned</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 7. USERS MANAGEMENT & BALANCE ADJUSTMENT                     */}
          {/* ============================================================ */}
          {activeTab === 'users' && (
            <div className="max-w-3xl space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#FF6128]" />
                  <span>User Portfolio & Live Balance Adjuster</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Search any user by Telegram Numeric ID, @Username, or Referral Code. View full profile metrics and credit/debit balances with automatic Telegram Bot notification.
                </p>
              </div>

              <div className="bg-[#0E121B] rounded-2xl p-6 border border-white/10 space-y-5">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchUser();
                      }}
                      placeholder="Enter Telegram Username (e.g. @john) or numeric ID (e.g. 5977573271)..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-xs text-white outline-none focus:border-[#FF6128]"
                    />
                  </div>
                  <button
                    onClick={handleSearchUser}
                    disabled={isSearchingUser}
                    className="px-6 py-3.5 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] disabled:opacity-50 text-white text-xs font-black cursor-pointer flex items-center space-x-2"
                  >
                    {isSearchingUser ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>

                {foundUser && (
                  <div className="bg-black/60 p-5 rounded-2xl border border-white/10 space-y-5 mt-3 animate-fadeIn">
                    {/* Header Identity Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6128] to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#FF6128]/20 shrink-0">
                          {foundUser.photoUrl ? (
                            <img
                              src={foundUser.photoUrl}
                              alt={foundUser.username}
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            (foundUser.firstName?.[0] || foundUser.username?.[0] || 'U').toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-black text-white">
                              {foundUser.firstName ? `${foundUser.firstName} ${foundUser.lastName || ''}`.trim() : (foundUser.username || 'User')}
                            </h3>
                            {foundUser.level && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-[10px] font-black text-amber-400">
                                LVL {foundUser.level}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {foundUser.username && (
                              <a
                                href={`https://t.me/${foundUser.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-mono text-[#00DF8F] hover:underline flex items-center space-x-1"
                              >
                                <span>@{foundUser.username}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(String(foundUser.id));
                                setCopiedUserId(true);
                                setTimeout(() => setCopiedUserId(false), 2000);
                              }}
                              className="text-[11px] font-mono text-gray-400 hover:text-white bg-white/5 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-white/5 cursor-pointer"
                              title="Click to copy ID"
                            >
                              <span>ID: #{foundUser.id}</span>
                              {copiedUserId ? (
                                <Check className="w-2.5 h-2.5 text-[#00DF8F]" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-gray-400" />
                              )}
                            </button>
                            {foundUser.createdAt && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                Joined {new Date(foundUser.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                          Referral Code
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 mt-0.5">
                          {foundUser.referralCode || `ref_${foundUser.id}`}
                        </span>
                      </div>
                    </div>

                    {/* 3-Column Balances Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#121622] border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider">Earned USDT</span>
                          <Wallet className="w-4 h-4 text-[#00DF8F]" />
                        </div>
                        <div className="text-lg font-black text-[#00DF8F] font-mono">
                          ${Number(foundUser.usdtBalance || 0).toFixed(4)}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">Withdrawable Balance</span>
                      </div>

                      <div className="bg-[#121622] border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider">Deposit / Topup</span>
                          <DollarSign className="w-4 h-4 text-[#FF6128]" />
                        </div>
                        <div className="text-lg font-black text-[#FF6128] font-mono">
                          ${Number(foundUser.depositBalance || 0).toFixed(4)}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">For Creating Campaigns</span>
                      </div>

                      <div className="bg-[#121622] border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider">FN Coins</span>
                          <Coins className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-lg font-black text-amber-400 font-mono">
                          {Number(foundUser.fgBalance || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">Community Reward Coin</span>
                      </div>
                    </div>

                    {/* Performance & Referral Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Tasks Completed</span>
                        <span className="text-sm font-black text-white font-mono mt-0.5 block">
                          {foundUser.totalCompletedTasksCount ?? foundUser.tasksCompleted ?? 0}
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Total Referrals</span>
                        <span className="text-sm font-black text-white font-mono mt-0.5 block">
                          {foundUser.totalReferrals ?? 0} users
                        </span>
                      </div>

                      <div className="bg-black/40 border border-[#00DF8F]/20 bg-[#00DF8F]/5 rounded-xl p-3">
                        <span className="text-[10px] text-[#00DF8F] block font-bold uppercase">Active Referrals</span>
                        <span className="text-sm font-black text-[#00DF8F] font-mono mt-0.5 block">
                          {foundUser.activeReferralsCount ?? 0} (≥30 Tasks)
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Referred By</span>
                        <span className="text-xs font-mono font-bold text-gray-300 truncate mt-1 block">
                          {foundUser.referrerInfo ? (
                            <a
                              href={`https://t.me/${foundUser.referrerInfo.username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#00DF8F] hover:underline"
                            >
                              @{foundUser.referrerInfo.username}
                            </a>
                          ) : (
                            foundUser.referredBy || 'Direct / None'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Direct Balance Adjustment Controls */}
                    <div className="bg-[#121622] p-5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                          <Bot className="w-3.5 h-3.5 text-[#00DF8F]" />
                          <span>Adjust Balance & Notify User via Bot</span>
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Live Telegram Delivery via @TikoGrowbot
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                            Earned USDT (+ / -)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={usdtDelta}
                            onChange={(e) => setUsdtDelta(e.target.value)}
                            placeholder="+0.05 or -0.05"
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-[#00DF8F] outline-none font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                            Topup / Deposit USDT (+ / -)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={depositDelta}
                            onChange={(e) => setDepositDelta(e.target.value)}
                            placeholder="+1.00 or -1.00"
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-[#FF6128] outline-none font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                            FN Coins (+ / -)
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={fgDelta}
                            onChange={(e) => setFgDelta(e.target.value)}
                            placeholder="+50 or -50"
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-amber-400 outline-none font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                          Reason / Note (Included in user's Telegram bot message)
                        </label>
                        <input
                          type="text"
                          value={balanceNote}
                          onChange={(e) => setBalanceNote(e.target.value)}
                          placeholder="e.g. Campaign refund, bonus reward, deposit adjustment..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyBalanceAdjustment}
                        disabled={isAdjustingBalance || (!usdtDelta && !depositDelta && !fgDelta)}
                        className="w-full py-3.5 rounded-xl bg-[#00DF8F] hover:bg-[#00c780] disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-2"
                      >
                        {isAdjustingBalance ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating DB & Sending Bot Notification...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply Changes & Send Bot Notification 🚀</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Recent Withdrawals & Deposits Accordion/Preview */}
                    {((foundUser.recentWithdrawals && foundUser.recentWithdrawals.length > 0) || (foundUser.recentDeposits && foundUser.recentDeposits.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Recent Withdrawals */}
                        <div className="bg-black/40 border border-white/5 rounded-xl p-3.5">
                          <span className="text-xs font-black text-white uppercase block mb-2">
                            Recent Withdrawals ({foundUser.recentWithdrawals?.length || 0})
                          </span>
                          {foundUser.recentWithdrawals?.length ? (
                            <div className="space-y-2">
                              {foundUser.recentWithdrawals.map((w) => (
                                <div
                                  key={w.id}
                                  className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white/5"
                                >
                                  <div>
                                    <span className="font-bold font-mono text-white">
                                      ${Number(w.amount).toFixed(2)} USDT
                                    </span>
                                    <span className="text-[10px] text-gray-400 block font-mono">
                                      {w.method?.toUpperCase()} • {new Date(w.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      w.status === 'completed' || w.status === 'paid'
                                        ? 'bg-[#00DF8F]/20 text-[#00DF8F]'
                                        : w.status === 'rejected'
                                        ? 'bg-rose-500/20 text-rose-400'
                                        : 'bg-amber-400/20 text-amber-400'
                                    }`}
                                  >
                                    {w.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-500">No withdrawal records found.</p>
                          )}
                        </div>

                        {/* Recent Deposits */}
                        <div className="bg-black/40 border border-white/5 rounded-xl p-3.5">
                          <span className="text-xs font-black text-white uppercase block mb-2">
                            Recent Deposits ({foundUser.recentDeposits?.length || 0})
                          </span>
                          {foundUser.recentDeposits?.length ? (
                            <div className="space-y-2">
                              {foundUser.recentDeposits.map((d) => (
                                <div
                                  key={d.id}
                                  className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white/5"
                                >
                                  <div>
                                    <span className="font-bold font-mono text-[#00DF8F]">
                                      +${Number(d.amount).toFixed(2)} USDT
                                    </span>
                                    <span className="text-[10px] text-gray-400 block font-mono">
                                      {d.network} • {new Date(d.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      d.status === 'success' || d.status === 'credited'
                                        ? 'bg-[#00DF8F]/20 text-[#00DF8F]'
                                        : 'bg-amber-400/20 text-amber-400'
                                    }`}
                                  >
                                    {d.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-500">No deposit records found.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 8. TELEGRAM BOT BROADCAST NOTIFIER                           */}
          {/* ============================================================ */}
          {activeTab === 'broadcast' && (
            <div className="max-w-2xl space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Telegram Bot Push Announcement
                </h2>
                <p className="text-xs text-gray-400">
                  Broadcast instant notification messages to all registered members via @TikoGrowbot.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!broadcastTitle || !broadcastMsg) return;
                  adminSendBroadcast({
                    title: broadcastTitle,
                    message: broadcastMsg,
                    url: broadcastUrl
                  });
                  setBroadcastTitle('');
                  setBroadcastMsg('');
                  setBroadcastUrl('');
                  showToast('Broadcast dispatched to @TikoGrowbot queue! 📣', 'success');
                }}
                className="bg-[#0E121B] rounded-2xl p-6 border border-white/10 space-y-4"
              >
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. 🚀 Special 2x Reward Campaign Weekend!"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none font-bold focus:border-[#FF6128]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Write details for the announcement..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none resize-none focus:border-[#FF6128]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Optional Action Button URL
                  </label>
                  <input
                    type="url"
                    value={broadcastUrl}
                    onChange={(e) => setBroadcastUrl(e.target.value)}
                    placeholder="https://t.me/AirdropIdentify"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none font-mono focus:border-[#FF6128]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                >
                  Send Push to All Members 🚀
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 9. SYSTEM CONFIGURATION & REWARD RATES                       */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  System Rates &amp; Economic Settings
                </h2>
                <p className="text-xs text-gray-400">
                  Configure token exchange rate, minimum withdrawal requirements, and defaults.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  adminUpdateConfig({
                    rate: Number(sysRate),
                    minWithdrawUsdt: Number(sysMinWithdraw),
                    tgReward: Number(sysTgReward),
                    twReward: Number(sysTwReward),
                    checkinReward: Number(sysCheckinReward)
                  });
                  showToast('Configuration saved successfully! 💾', 'success');
                }}
                className="bg-[#0E121B] rounded-2xl p-6 border border-white/10 space-y-4"
              >
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Exchange Rate (1 FN Coin = ? USDT)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={sysRate}
                    onChange={(e) => setSysRate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Minimum Withdrawal Threshold (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sysMinWithdraw}
                    onChange={(e) => setSysMinWithdraw(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                      Default Telegram Reward ($)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={sysTgReward}
                      onChange={(e) => setSysTgReward(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                      Default Twitter Reward ($)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={sysTwReward}
                      onChange={(e) => setSysTwReward(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                >
                  Save Configuration 💾
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* TASK CREATE / EDIT MODAL POPUP                               */}
      {/* ============================================================ */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-lg font-black text-white">
                {editingTaskId ? 'Edit Task Campaign' : 'Create & Publish New Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                  Platform Category
                </label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                >
                  <option value="telegram">Telegram Channel/Group</option>
                  <option value="twitter">Twitter (X) Follow/Repost</option>
                  <option value="ads">Google Sponsor Ad</option>
                  <option value="youtube">YouTube Subscribe</option>
                  <option value="website">External Website</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Join Official Announcement Channel"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                  Target Link / URL (e.g. https://... or t.me/... or @username)
                </label>
                <input
                  type="text"
                  value={taskForm.link}
                  onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                  placeholder="https://t.me/your_channel or @your_channel"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                    USDT Reward
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={taskForm.usdtReward}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, usdtReward: Number(e.target.value) })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-[#00DF8F] outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                    FN Coins Reward
                  </label>
                  <input
                    type="number"
                    value={taskForm.fgReward}
                    onChange={(e) => setTaskForm({ ...taskForm, fgReward: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-amber-400 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Target Participant Limit / Slots */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase text-gray-400 block">
                    Target Members / Completion Limit 👥
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Auto-ends when filled
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 20, 50, 100, 500"
                  value={taskForm.participants}
                  onChange={(e) => setTaskForm({ ...taskForm, participants: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono font-bold"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  ⚡ When <span className="text-amber-400 font-bold">{taskForm.participants || 20}</span> users complete this task, it will automatically end and disappear from the bot/mini app.
                </p>
              </div>

              {/* Blue Verified Badge Switch */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img
                    src="/blue_verified.png"
                    alt="Verified"
                    className="w-6 h-6 object-contain"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-white block">
                      Blue Verified Badge 🔵
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Shows official verified tick next to task
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTaskForm({ ...taskForm, isVerified: !taskForm.isVerified })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                    taskForm.isVerified ? 'bg-[#00DF8F]' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      taskForm.isVerified ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="flex-1 py-3 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] disabled:opacity-50 text-white text-xs font-black uppercase cursor-pointer transition-all"
                >
                  {isSubmittingTask
                    ? 'Publishing to DB & Bot...'
                    : (editingTaskId ? 'Save Changes' : 'Publish Task Live 🚀')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PAYOUT APPROVAL & NOTIFY USER MODAL                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {payoutModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E121B] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#00DF8F]/20 text-[#00DF8F] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">Approve &amp; Send Bot SMS</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Order ID: #{payoutModalItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalItem(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User & Payout Summary Card */}
            <div className="bg-[#121622] rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold">User:</span>
                <span className="font-extrabold text-white font-mono">
                  @{payoutModalItem.username || payoutModalItem.firstName || 'user'} (ID: #{payoutModalItem.userId})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold">Tasks Completed:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {payoutModalItem.doneTasksCount || 0} tasks done
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-gray-400 font-bold">Withdraw Amount:</span>
                <span className="text-base font-black text-[#00DF8F] font-mono">
                  ${Number(payoutModalItem.amountUsdt || 0).toFixed(2)} USDT
                </span>
              </div>
              <div className="pt-1 border-t border-white/5">
                <span className="text-gray-400 font-bold block mb-1">BEP-20 Wallet:</span>
                <span className="text-[11px] font-mono text-gray-200 break-all bg-black/40 p-2 rounded-xl block border border-white/5">
                  {payoutModalItem.bep20Address}
                </span>
              </div>
            </div>

            {/* Optional TxHash Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-300 block">
                BSC Transaction Hash (Optional)
              </label>
              <input
                type="text"
                value={payoutTxHash}
                onChange={(e) => setPayoutTxHash(e.target.value)}
                placeholder="0x... (leave empty for auto verification)"
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-600 outline-none focus:border-[#00DF8F]"
              />
              <span className="text-[10px] text-gray-400 block">
                If provided, user receives a clickable BscScan button in their Telegram notification.
              </span>
            </div>

            {/* Bot Notification Notice */}
            <div className="bg-[#00DF8F]/10 border border-[#00DF8F]/25 rounded-2xl p-3 text-xs text-[#00DF8F] flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-[11px] leading-tight font-medium">
                Confirming will mark this withdrawal as Paid and <strong>send an instant Telegram SMS with buttons</strong> directly to the user!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalItem(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingPayout}
                onClick={async () => {
                  setIsSubmittingPayout(true);
                  try {
                    await adminMarkWithdrawalPaid(
                      payoutModalItem.id,
                      payoutTxHash.trim() || '0x_bep20_admin_settled'
                    );
                    setPayoutModalItem(null);
                  } finally {
                    setIsSubmittingPayout(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-[#00DF8F] hover:bg-[#00c780] text-black text-xs font-black uppercase cursor-pointer flex items-center justify-center space-x-1 shadow-lg shadow-[#00DF8F]/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingPayout ? 'Sending SMS...' : 'CONFIRM & SEND SMS 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. WITHDRAWAL REJECT & REFUND MODAL                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E121B] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">Reject &amp; Refund User</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Order ID: #{rejectModalItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#121622] rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold">User:</span>
                <span className="font-extrabold text-white font-mono">
                  @{rejectModalItem.username || rejectModalItem.firstName || 'user'} (ID: #{rejectModalItem.userId})
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-gray-400 font-bold">Amount to Refund:</span>
                <span className="text-base font-black text-rose-400 font-mono">
                  ${Number(rejectModalItem.amountUsdt || 0).toFixed(2)} USDT
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-300 block">
                Rejection Reason (Sent to User)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this withdrawal was rejected..."
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-xs text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="text-[11px] leading-tight">
                This will refund <strong>${Number(rejectModalItem.amountUsdt || 0).toFixed(2)} USDT</strong> back to the user's Earned balance and send them a Telegram notification.
              </span>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReject}
                onClick={async () => {
                  setIsSubmittingReject(true);
                  try {
                    await adminRejectWithdrawal(
                      rejectModalItem.id,
                      rejectReason.trim() || 'Rejected by Admin'
                    );
                    setRejectModalItem(null);
                  } finally {
                    setIsSubmittingReject(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase cursor-pointer flex items-center justify-center space-x-1 shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <span>{isSubmittingReject ? 'Refunding...' : 'CONFIRM REJECT & REFUND ↩️'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE ADVANCE TASK MODAL                                     */}
      {/* ============================================================ */}
      {isCreateAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 relative max-h-[90vh] overflow-y-auto no-scrollbar animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-lg font-black text-white">Create New Advance Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAdvanceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingAdvance(true);
                try {
                  const created = await adminCreateAdvanceTask(advanceForm);
                  if (created) {
                    setIsCreateAdvanceModalOpen(false);
                    setAdvanceForm({
                      title: '',
                      instructions: '',
                      link: '',
                      usdtReward: '0.50',
                      fgReward: '50',
                      participants: '100'
                    });
                  }
                } finally {
                  setIsSubmittingAdvance(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                  Advance Task Title
                </label>
                <input
                  type="text"
                  value={advanceForm.title}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, title: e.target.value })}
                  placeholder="e.g. Register on Binance & Complete KYC Level 1"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                  Target Link / Registration URL (e.g. https://... or @channel or website)
                </label>
                <input
                  type="text"
                  value={advanceForm.link}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, link: e.target.value })}
                  placeholder="https://... or @channel"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-mono focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                  Detailed Instructions (How to Complete &amp; Screenshot Guidance)
                </label>
                <textarea
                  value={advanceForm.instructions}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, instructions: e.target.value })}
                  placeholder={"1. Click link and sign up with code\n2. Complete KYC identity verification\n3. Take a screenshot showing your verified account profile\n4. Upload the screenshot below to receive reward"}
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400 resize-none font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">
                    USDT Reward
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={advanceForm.usdtReward}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, usdtReward: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-[#00DF8F] font-mono outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">
                    FN Coin Reward
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={advanceForm.fgReward}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, fgReward: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-amber-400 font-mono outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-gray-400 block mb-1">
                    Participant Slots
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={advanceForm.participants}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, participants: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                <span className="font-bold block">⚡ Instant Telegram Bot Broadcast:</span>
                <span className="text-[11px] opacity-90">When created, this advance task will immediately broadcast to all users via @TikoGrowbot!</span>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateAdvanceModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdvance}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>{isSubmittingAdvance ? 'Publishing to DB & Bot...' : 'Publish Advance Task 🚀'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREENSHOT FULLSCREEN ZOOM PREVIEW MODAL                      */}
      {/* ============================================================ */}
      {previewScreenshotUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="absolute -top-12 right-0 flex items-center space-x-2">
              <a
                href={resolveAdminMediaUrl(previewScreenshotUrl)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="py-1 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>Open in Tab ↗</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={resolveAdminMediaUrl(previewScreenshotUrl)}
              alt="Fullscreen screenshot proof"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-gray-400 mt-3 font-mono">
              Click anywhere outside or press Close to dismiss
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
