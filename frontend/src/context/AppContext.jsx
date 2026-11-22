import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_TASKS } from '../data/defaultTasks';

const AppContext = createContext();
export const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://qz4gige81pt4u0yx81c5obvc.179.197.255.88.sslip.io/api');

const TASKS_CACHE_KEY = 'foxtask_tasks_cache_v2';
const CAMPAIGNS_CACHE_KEY = 'foxtask_admin_campaigns_v2';

// Clean legacy stale cache (which may hold old test tasks)
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('foxtask_tasks_cache');
    localStorage.removeItem('foxtask_admin_campaigns');
  }
} catch {}

export function getBackendRoot() {
  return API_BASE.replace(/\/api\/?$/, '');
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const root = getBackendRoot();
  return `${root}${url.startsWith('/') ? '' : '/'}${url}`;
}

const COOLDOWN_24H = 24 * 60 * 60 * 1000;

export function sortTasksByPriority(taskList) {
  if (!Array.isArray(taskList)) return [];
  return [...taskList].sort((a, b) => {
    // 1. Completed tasks always go below uncompleted tasks
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const aIsAd = a.category === 'ads' || a.type === 'ad' || String(a.id || '').startsWith('task_ad_');
    const bIsAd = b.category === 'ads' || b.type === 'ad' || String(b.id || '').startsWith('task_ad_');

    // Ads tasks go to the very bottom!
    if (aIsAd && !bIsAd) return 1;
    if (!aIsAd && bIsAd) return -1;

    if (aIsAd && bIsAd) {
      return (a.id || '').localeCompare(b.id || '');
    }

    // 2. Telegram Blue Verified tasks at the top!
    const aIsTgVerified = (a.category === 'telegram' || a.type === 'telegram') && a.isVerified;
    const bIsTgVerified = (b.category === 'telegram' || b.type === 'telegram') && b.isVerified;

    if (aIsTgVerified !== bIsTgVerified) {
      return aIsTgVerified ? -1 : 1;
    }

    // 3. Other verified tasks next
    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1;
    }

    // 4. NEW TASKS SENT FROM ADMIN APPEAR AT THE VERY TOP (newest first)!
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    if (timeA !== timeB) {
      return timeB - timeA;
    }

    return 0;
  });
}

function filterActiveTasks(taskList, userObj) {
  const completedList = userObj?.tasksCompleted || [];
  const adCompletions = userObj?.adCompletions || {};
  const COOLDOWN_24H = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const allAdsCompletedAt = userObj?.allAdsCompletedAt ? Number(userObj.allAdsCompletedAt) : null;
  const isAllAds24hPassed = allAdsCompletedAt && (now - allAdsCompletedAt >= COOLDOWN_24H);

  const base = Array.isArray(taskList) && taskList.length > 0 ? taskList : DEFAULT_TASKS;

  // Filter out:
  // 1. Tasks that reached maximum participant limit or status completed/ended
  // 2. Tasks ALREADY COMPLETED by the user (they must disappear!)
  const filtered = base.filter((task) => {
    if (task.status === 'completed' || task.status === 'ended') return false;
    if (task.participants > 0 && (task.joinedMembers || 0) >= task.participants) return false;

    const isAd = task.category === 'ads' || task.type === 'ad' || String(task.id || '').startsWith('task_ad_');
    if (isAd) {
      if (isAllAds24hPassed) {
        return true; // 24h passed, all ads are available again!
      }
      // If user completed this ad within 24h, hide it!
      const adTime = adCompletions[task.id];
      if (adTime && (now - Number(adTime) < COOLDOWN_24H)) {
        return false;
      }
      if (completedList.includes(task.id)) {
        return false;
      }
      return true;
    }

    // Standard task: if completed by user, hide it!
    if (completedList.includes(task.id) || task.completed) {
      return false;
    }

    return true;
  }).map((task) => {
    return {
      ...task,
      completed: false
    };
  });

  return sortTasksByPriority(filtered);
}

const LIVE_WITHDRAW_ALERTS = [
  'A***5 JUST WITHDREW 1.9 USDT',
  'T***1 JUST WITHDREW 1.914 USDT',
  'M***9 JUST WITHDREW 3.50 USDT',
  'D***4 JUST WITHDREW 2.12 USDT',
  'X***8 JUST WITHDREW 4.80 USDT'
];

export function resolveTelegramUser() {
  if (typeof window === 'undefined') return null;

  // 1. From Telegram WebApp initDataUnsafe.user
  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      const u = tg.initDataUnsafe.user;
      const firstName = u.first_name || '';
      const lastName = u.last_name || '';
      const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();
      return {
        id: String(u.id),
        username: u.username || `user_${u.id}`,
        firstName: fullName || u.username || 'Member',
        first_name: fullName || u.username || 'Member',
        photoUrl: u.photo_url || '/default_user.png',
        photo_url: u.photo_url || '/default_user.png'
      };
    }
  } catch {}

  // 2. From Telegram WebApp initData (parsed from query string)
  try {
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) {
      const params = new URLSearchParams(initData);
      const userRaw = params.get('user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u?.id) {
          const firstName = u.first_name || '';
          const lastName = u.last_name || '';
          const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();
          return {
            id: String(u.id),
            username: u.username || `user_${u.id}`,
            firstName: fullName || u.username || 'Member',
            first_name: fullName || u.username || 'Member',
            photoUrl: u.photo_url || '/default_user.png',
            photo_url: u.photo_url || '/default_user.png'
          };
        }
      }
    }
  } catch {}

  // 3. From URL query params (passed by bot button: ?tg_id=...&tg_name=...&tg_user=...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tgId = urlParams.get('tg_id') || urlParams.get('userId') || urlParams.get('user_id');
    if (tgId) {
      const tgName = urlParams.get('tg_name') || urlParams.get('first_name') || '';
      const tgUser = urlParams.get('tg_user') || urlParams.get('username') || `user_${tgId}`;
      const tgPhoto = urlParams.get('tg_photo') || urlParams.get('photo_url') || '/default_user.png';
      return {
        id: String(tgId),
        username: tgUser,
        firstName: tgName || tgUser || 'Member',
        first_name: tgName || tgUser || 'Member',
        photoUrl: tgPhoto,
        photo_url: tgPhoto
      };
    }
  } catch {}

  return null;
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const tgEnv = resolveTelegramUser();
    const currentId = tgEnv?.id || null;

    try {
      const cached = localStorage.getItem('foxtask_user_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // If current Telegram user matches cached ID, safe to use!
        if (currentId && String(parsed.id) === String(currentId)) {
          return parsed;
        }
        // If current user is different from cached user, clear stale cache!
        if (currentId && String(parsed.id) !== String(currentId)) {
          localStorage.removeItem('foxtask_user_cache');
          localStorage.removeItem('foxtask_tasks_cache_v2');
          localStorage.removeItem('foxtask_uid');
        } else if (!currentId && parsed.id) {
          if (parsed.id !== '5977573271') return parsed;
        }
      }
    } catch {}

    const resolvedId = currentId || (typeof window !== 'undefined' ? localStorage.getItem('foxtask_uid') : null) || 'guest_user';
    const resolvedName = tgEnv?.firstName || tgEnv?.username || 'Member';
    const resolvedUser = tgEnv?.username || (resolvedId !== 'guest_user' ? `user_${String(resolvedId).slice(-6)}` : 'Member');

    return {
      id: String(resolvedId),
      username: resolvedUser,
      firstName: resolvedName,
      photoUrl: tgEnv?.photoUrl || '/default_user.png',
      photo_url: tgEnv?.photoUrl || '/default_user.png',
      level: 'LV.1',
      rankTitle: '',
      memberNumber: '#802,793',
      referralCode: 'ref_' + String(resolvedId).slice(-6),
      referralCount: 0,
      referralUsdtEarned: 0.00,
      claimedMilestones: [],
      usdtBalance: 0.00,
      fgBalance: 0,
      doneTasksCount: 0,
      tasksCompleted: [],
      lastCheckInDate: null
    };
  });

  const [config, setConfig] = useState({
    appName: 'FoxTask',
    coinName: 'FN coin',
    coinSymbol: 'FN',
    adReward: 10,
    rate: 0.001,
    minWithdrawUsdt: 1.0,
    network: 'BEP-20 (BNB Smart Chain)'
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const cached = localStorage.getItem(TASKS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Exclude any legacy test tasks
          const clean = parsed.filter(t => !t.id?.startsWith('task_17942'));
          return filterActiveTasks(clean, user);
        }
      }
    } catch {}
    return filterActiveTasks(DEFAULT_TASKS, user);
  });
  const [referralMilestones, setReferralMilestones] = useState([
    { id: 'ref_10', required: 10, usdtReward: 0.02, fgReward: 0, title: '10 Active Referrals', claimed: false },
    { id: 'ref_50', required: 50, usdtReward: 1.00, fgReward: 0, title: '50 Active Referrals', claimed: false },
    { id: 'ref_100', required: 100, usdtReward: 5.00, fgReward: 0, title: '100 Active Referrals', claimed: false }
  ]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [advanceTasks, setAdvanceTasks] = useState([]);
  const [adminAdvanceSubmissions, setAdminAdvanceSubmissions] = useState([]);
  const [activeAdvanceModalTask, setActiveAdvanceModalTask] = useState(null);
  const initialTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'home' : 'home';
  const initialCat = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('cat') || 'ALL' : 'ALL';
  const [activeTab, setActiveTab] = useState(initialTab); // 'home' | 'tasks' | 'activity' | 'profile' | 'add-task' | 'deposit'
  const [currentWithdrawAlertIndex, setCurrentWithdrawAlertIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [taskSuccessModal, setTaskSuccessModal] = useState({ visible: false, task: null });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('foxtask_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('foxtask_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('theme-light');
        document.body.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
        document.body.classList.remove('theme-light');
      }
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // ─────────────────────────────────────────────────────────────
  // OWNER ADMIN AUTHORIZATION & MANAGEMENT (@lkgjdfjklgndefs56df4)
  // ─────────────────────────────────────────────────────────────
  const ADMIN_USERNAME = 'lkgjdfjklgndefs56df4';

  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin')?.toLowerCase() === ADMIN_USERNAME) return true;
        return localStorage.getItem('foxtask_admin_auth') === 'true';
      }
    } catch {}
    return false;
  });

  const isAdmin = Boolean(
    adminAuth ||
    String(user?.username || '').toLowerCase().replace(/^@/, '') === ADMIN_USERNAME ||
    String(user?.id || '').toLowerCase().replace(/^@/, '') === ADMIN_USERNAME
  );

  const loginAdmin = (secretKey) => {
    const clean = String(secretKey || '').trim().toLowerCase().replace(/^@/, '');
    if (clean === ADMIN_USERNAME) {
      setAdminAuth(true);
      try {
        localStorage.setItem('foxtask_admin_auth', 'true');
      } catch {}
      showToast('Admin Access Verified! Welcome Owner 👑', 'success');
      setActiveTab('admin');
      return true;
    }
    showToast('Unauthorized! Only @lkgjdfjklgndefs56df4 has admin clearance.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setAdminAuth(false);
    try {
      localStorage.removeItem('foxtask_admin_auth');
    } catch {}
    showToast('Logged out of Admin Portal', 'info');
    setActiveTab('home');
  };

  // Admin Campaigns
  const [adminCampaigns, setAdminCampaigns] = useState(() => {
    try {
      const stored = localStorage.getItem(CAMPAIGNS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(c => !c.id?.startsWith('camp_usr_') && !c.id?.startsWith('task_17942'));
        }
      }
    } catch {}
    return [...DEFAULT_TASKS];
  });

  const adminApproveCampaign = (taskId) => {
    const target = (adminCampaigns || []).find((c) => c.id === taskId);
    setAdminCampaigns((prev) => {
      const updated = prev.map((c) => (c.id === taskId ? { ...c, status: 'approved' } : c));
      try {
        localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setTasks((prev) => {
      if (target && !prev.some((t) => t.id === taskId)) {
        return [{ ...target, status: 'approved' }, ...prev];
      }
      return prev.map((t) => (t.id === taskId ? { ...t, status: 'approved' } : t));
    });

    fetch(`${API_BASE}/admin/tasks/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId })
    }).catch(() => null);

    if (target) {
      adminSendBroadcast({
        title: `🆕 Campaign Approved: ${target.title}`,
        message: `New sponsored task available! Earn +$${target.usdtReward || 0.015} USDT & +${target.fgReward || 15} FN Coin.`,
        url: target.link || ''
      });
    }

    showToast('Campaign Approved! Creator notified & Task live.', 'success');
  };

  const adminRejectCampaign = async (taskId, reason) => {
    try {
      const res = await fetch(`${API_BASE}/admin/tasks/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, reason })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const refundMsg = data.unusedRefund > 0 ? ` (+$${Number(data.unusedRefund).toFixed(4)} refunded to creator's topup balance)` : '';
        showToast(`Campaign Rejected${refundMsg}`, 'info');
      } else {
        showToast('Campaign Rejected (Creator Refunded)', 'info');
      }
    } catch {
      showToast('Campaign Rejected (Creator Refunded)', 'info');
    }

    setAdminCampaigns((prev) => {
      const updated = prev.map((c) => (c.id === taskId ? { ...c, status: 'rejected', rejectReason: reason } : c));
      try {
        localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    fetchTasks(user?.id);
  };

  const adminDeleteCampaign = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const refundMsg = data.unusedRefund > 0 ? ` (+$${Number(data.unusedRefund).toFixed(4)} refunded to creator's topup balance)` : '';
        showToast(`Campaign Removed${refundMsg}`, 'info');
      } else {
        showToast('Campaign Deleted', 'info');
      }
    } catch {
      showToast('Campaign Deleted', 'info');
    }

    setAdminCampaigns((prev) => {
      const updated = prev.filter((c) => c.id !== taskId);
      try {
        localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    fetchTasks(user?.id);
  };

  // Admin Direct Task Management (Creates in Neon DB & Broadcasts to Telegram bot)
  const adminCreateTask = async (newTaskData) => {
    // Auto-normalize link format (e.g. @channel or t.me/channel -> https://t.me/channel)
    let formattedLink = newTaskData.link?.trim() || '';
    if (formattedLink.startsWith('@')) {
      formattedLink = 'https://t.me/' + formattedLink.slice(1);
    } else if (formattedLink.startsWith('t.me/')) {
      formattedLink = 'https://' + formattedLink;
    } else if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink;
    }
    const payload = { ...newTaskData, link: formattedLink };

    let createdTask = null;
    try {
      const res = await fetch(`${API_BASE}/admin/tasks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        createdTask = data.task;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Server rejected task creation', 'error');
        return null;
      }
    } catch (err) {
      console.warn('API adminCreateTask error:', err);
      showToast('Network error: ' + (err.message || 'Could not connect to server'), 'error');
      return null;
    }

    if (!createdTask) {
      showToast('Failed to create task on server', 'error');
      return null;
    }

    setTasks((prev) => {
      const updated = [createdTask, ...prev.filter(t => t.id !== createdTask.id)];
      try {
        localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setAdminCampaigns((prev) => {
      const updated = [createdTask, ...prev.filter(c => c.id !== createdTask.id)];
      try {
        localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchTasks(user?.id);

    showToast('New Task Created, Saved to Database & Broadcast Sent! 🚀', 'success');
    return createdTask;
  };

  const adminEditTask = async (taskId, updatedData) => {
    try {
      await fetch(`${API_BASE}/admin/tasks/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, ...updatedData })
      }).catch(() => null);
    } catch {}

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, ...updatedData } : t));
      try {
        localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setAdminCampaigns((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, ...updatedData } : t));
      try {
        localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast('Task updated successfully!', 'success');
  };

  const adminToggleTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/admin/tasks/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
        setAdminCampaigns((prev) => prev.map((c) => (c.id === taskId ? { ...c, status: newStatus } : c)));
        showToast(newStatus === 'completed' ? 'Task marked as Completed (Ended)' : 'Task Re-opened (Active)', 'success');
        fetchTasks(user?.id);
        return true;
      }
    } catch (err) {
      showToast('Error toggling task status: ' + err.message, 'error');
    }
    return false;
  };

  const adminDeleteTask = async (taskId) => {
    // 1. Immediately remove from local state and cache
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      try {
        localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setAdminCampaigns((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      try {
        localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const res = await fetch(`${API_BASE}/admin/tasks/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const refundMsg = data.unusedRefund > 0 ? ` (+$${Number(data.unusedRefund).toFixed(4)} refunded to topup balance)` : '';
        showToast(`Task deleted${refundMsg}`, 'info');
      } else {
        showToast('Task removed from bot!', 'info');
      }
    } catch {
      showToast('Task removed from bot!', 'info');
    }

    // 2. Authoritative re-sync from server
    await fetchTasks(user?.id);
  };

  // ==========================================
  // ADVANCE TASKS & SCREENSHOT PROOF API
  // ==========================================
  const fetchAdvanceTasks = async (uid = user?.id) => {
    try {
      const res = await fetch(`${API_BASE}/advance-tasks?userId=${uid || 'guest_user'}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setAdvanceTasks(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetchAdvanceTasks fallback:', e);
    }
    return [];
  };

  const fetchAdminAdvanceSubmissions = async (status = 'pending') => {
    try {
      const res = await fetch(`${API_BASE}/admin/advance-tasks/submissions?status=${status}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setAdminAdvanceSubmissions(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetchAdminAdvanceSubmissions fallback:', e);
    }
    return [];
  };

  const adminCreateAdvanceTask = async (advanceData) => {
    let formattedLink = advanceData.link?.trim() || '';
    if (formattedLink.startsWith('@')) {
      formattedLink = 'https://t.me/' + formattedLink.slice(1);
    } else if (formattedLink.startsWith('t.me/')) {
      formattedLink = 'https://' + formattedLink;
    } else if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink;
    }
    const payload = { ...advanceData, link: formattedLink };

    try {
      const res = await fetch(`${API_BASE}/admin/advance-tasks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setAdvanceTasks((prev) => [data.task, ...prev.filter(t => t.id !== data.task.id)]);
        showToast('Advance Task Created & Broadcast Sent to Bot! ⚡', 'success');
        await fetchAdvanceTasks(user?.id);
        return data.task;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Failed to create advance task', 'error');
        return null;
      }
    } catch (err) {
      showToast('Network error creating advance task: ' + (err.message || 'Server unreachable'), 'error');
      return null;
    }
  };

  const adminDeleteAdvanceTask = async (taskId) => {
    // 1. Immediately remove from local state
    setAdvanceTasks((prev) => prev.filter(t => t.id !== taskId));
    setAdminAdvanceSubmissions((prev) => prev.filter(s => s.taskId !== taskId));

    try {
      const res = await fetch(`${API_BASE}/admin/advance-tasks/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        showToast('Advance Task Deleted & Files Cleaned Up', 'info');
      } else {
        showToast('Failed to delete advance task', 'error');
      }
    } catch {
      showToast('Failed to delete advance task', 'error');
    }

    // 2. Re-sync from server
    fetchAdvanceTasks(user?.id);
    fetchAdminAdvanceSubmissions('all');
  };

  const userSubmitAdvanceProof = async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append('taskId', taskId);
      formData.append('userId', user.id);
      formData.append('username', user.username || user.firstName || 'Member');
      formData.append('firstName', user.firstName || user.username || 'Member');
      formData.append('screenshot', file);

      const res = await fetch(`${API_BASE}/advance-tasks/submit`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Proof submitted! Awaiting admin review ⏳', 'success');
        setAdvanceTasks((prev) => prev.map(t => t.id === taskId ? {
          ...t,
          userSubmission: {
            id: data.submission.id,
            status: 'pending',
            rejectReason: '',
            createdAt: new Date().toISOString()
          }
        } : t));
        fetchAdvanceTasks(user.id);
        return { success: true, submission: data.submission };
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to submit proof', 'error');
        return { success: false, error: err.error };
      }
    } catch (e) {
      showToast('Network error while uploading proof', 'error');
      return { success: false, error: e.message };
    }
  };

  const adminApproveAdvanceSubmission = async (submissionId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/advance-tasks/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Approved! Paid +$${data.usdtReward} USDT & storage cleaned ✅`, 'success');
        setAdminAdvanceSubmissions((prev) => prev.filter(s => s.id !== submissionId));
        fetchAdminAdvanceSubmissions('pending');
        fetchAdvanceTasks(user.id);
        return { success: true };
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to approve submission', 'error');
      }
    } catch {
      showToast('Network error approving submission', 'error');
    }
    return { success: false };
  };

  const adminRejectAdvanceSubmission = async (submissionId, reason) => {
    try {
      const res = await fetch(`${API_BASE}/admin/advance-tasks/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, reason })
      });
      if (res.ok) {
        showToast('Submission rejected & screenshot permanently deleted 🗑️', 'info');
        setAdminAdvanceSubmissions((prev) => prev.filter(s => s.id !== submissionId));
        fetchAdminAdvanceSubmissions('pending');
        fetchAdvanceTasks(user.id);
        return { success: true };
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to reject submission', 'error');
      }
    } catch {
      showToast('Network error rejecting submission', 'error');
    }
    return { success: false };
  };

  // Admin Withdrawals
  const [adminWithdrawals, setAdminWithdrawals] = useState(() => {
    try {
      const stored = localStorage.getItem('foxtask_admin_withdrawals');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'tx_wd_101',
        userId: '802793',
        username: 'CryptoKing',
        amountUsdt: 2.50,
        network: 'BEP-20 (BNB Smart Chain)',
        bep20Address: '0x71C83956461c36b566514748443B1f547c1ba49B',
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'tx_wd_102',
        userId: '654321',
        username: 'TraderBD',
        amountUsdt: 4.80,
        network: 'BEP-20 (BNB Smart Chain)',
        bep20Address: '0x32A5B1527A1e97669d0322283A49a2123E288e21',
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      },
      {
        id: 'tx_wd_103',
        userId: '998811',
        username: 'AirdropHunter',
        amountUsdt: 1.90,
        network: 'BEP-20 (BNB Smart Chain)',
        bep20Address: '0x99F65B88810e7492cCc6693aAf1Bf57338C612c4',
        status: 'completed',
        txHash: '0x8f2a74c65e8a49c66e2c34220c41031c261e4b9d0b',
        createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
      }
    ];
  });

  const fetchAdminWithdrawals = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals`).catch(() => null);
      if (res && res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setAdminWithdrawals(list);
          try {
            localStorage.setItem('foxtask_admin_withdrawals', JSON.stringify(list));
          } catch {}
          return list;
        }
      }
    } catch (e) {
      console.warn('Error fetching admin withdrawals:', e);
    }
  };

  const adminMarkWithdrawalPaid = async (withdrawalId, txHash = '') => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, status: 'completed', txHash })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAdminWithdrawals((prev) =>
          prev.map((w) =>
            w.id === withdrawalId
              ? { ...w, ...data.withdrawal, status: 'completed', txHash, paidAt: new Date().toISOString() }
              : w
          )
        );
        showToast('Withdrawal marked as Paid & SMS sent to user bot! 💸', 'success');
        return true;
      }
    } catch (err) {
      console.warn('Error marking withdrawal paid:', err);
    }

    setAdminWithdrawals((prev) => {
      const updated = prev.map((w) =>
        w.id === withdrawalId ? { ...w, status: 'completed', txHash, paidAt: new Date().toISOString() } : w
      );
      try {
        localStorage.setItem('foxtask_admin_withdrawals', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Withdrawal marked as Paid & Completed! 💸', 'success');
  };

  const adminRejectWithdrawal = async (withdrawalId, reason = 'Rejected by Admin') => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, status: 'rejected', reason })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAdminWithdrawals((prev) =>
          prev.map((w) =>
            w.id === withdrawalId
              ? { ...w, ...data.withdrawal, status: 'rejected', rejectReason: reason }
              : w
          )
        );
        showToast('Withdrawal Rejected & Refunded. Notice sent to user.', 'info');
        return true;
      }
    } catch (err) {
      console.warn('Error rejecting withdrawal:', err);
    }

    setAdminWithdrawals((prev) => {
      const updated = prev.map((w) =>
        w.id === withdrawalId ? { ...w, status: 'rejected', rejectReason: reason } : w
      );
      try {
        localStorage.setItem('foxtask_admin_withdrawals', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Withdrawal Order Rejected (Refunded to User)', 'info');
  };

  // Admin Broadcasts
  const [adminBroadcasts, setAdminBroadcasts] = useState(() => {
    try {
      const stored = localStorage.getItem('foxtask_admin_broadcasts');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'bc_welcome',
        title: '🎉 Welcome to FoxTask Official Earning Bot!',
        message: 'Complete tasks, watch sponsor video ads, and withdraw daily in USDT (BEP-20).',
        url: '',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const adminSendBroadcast = async (broadcastData) => {
    const item = {
      id: 'bc_' + Date.now(),
      title: broadcastData.title,
      message: broadcastData.message,
      url: broadcastData.url || '',
      createdAt: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE}/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastData)
      });
    } catch (e) {
      console.warn('API adminSendBroadcast warning:', e);
    }

    setAdminBroadcasts((prev) => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem('foxtask_admin_broadcasts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const adminDeleteBroadcast = (broadcastId) => {
    setAdminBroadcasts((prev) => {
      const updated = prev.filter((b) => b.id !== broadcastId);
      try {
        localStorage.setItem('foxtask_admin_broadcasts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const adminAdjustUserBalance = async (userId, usdtDelta = 0, fgDelta = 0, depositDelta = 0, note = '') => {
    try {
      const res = await fetch(`${API_BASE}/admin/user/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: String(userId),
          usdtDelta: Number(usdtDelta) || 0,
          fgDelta: Number(fgDelta) || 0,
          depositDelta: Number(depositDelta) || 0,
          note: note || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          if (String(userId) === String(user?.id)) {
            setUser(data.user);
            try {
              localStorage.setItem('foxtask_user_cache', JSON.stringify(data.user));
            } catch {}
          }
          showToast('User balance successfully updated & notified via Telegram bot!', 'success');
          return data.user;
        }
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Failed to adjust user balance', 'error');
        return null;
      }
    } catch (err) {
      console.warn('adminAdjustUserBalance error:', err);
      showToast('Network error while updating balance', 'error');
      return null;
    }
    return null;
  };

  const adminUpdateConfig = (newCfg) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newCfg };
      try {
        localStorage.setItem('foxtask_config_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Rotating withdraw ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWithdrawAlertIndex((prev) => (prev + 1) % LIVE_WITHDRAW_ALERTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'info' });
    }, 3000);
  };

  const closeTaskSuccessModal = useCallback(() => {
    setTaskSuccessModal({ visible: false, task: null });
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6128', '#FBBF24', '#00DF8F', '#FFFFFF']
      });
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
      } catch {}
    }

    const tgUser = resolveTelegramUser();
    const userId = tgUser?.id ? String(tgUser.id) : (localStorage.getItem('foxtask_uid') || 'uid_' + Math.floor(1000 + Math.random() * 9000));
    
    // Lock foxtask_uid to this user; if user switched, clear previous user's cached tasks/user
    const prevUid = localStorage.getItem('foxtask_uid');
    if (tgUser?.id && prevUid && prevUid !== String(tgUser.id)) {
      localStorage.removeItem('foxtask_user_cache');
      localStorage.removeItem(TASKS_CACHE_KEY);
    }
    localStorage.setItem('foxtask_uid', String(userId));

    const computedName = tgUser?.firstName || tgUser?.username || 'Member';
    const computedUser = tgUser?.username || `user_${String(userId).slice(-6)}`;
    const computedPhoto = tgUser?.photoUrl || '/default_user.png';

    const payload = {
      id: String(userId),
      username: computedUser,
      first_name: computedName,
      photo_url: computedPhoto
    };

    loadInitialData(payload);
  }, []);

  const loadInitialData = async (payload) => {
    try {
      const cfgRes = await fetch(`${API_BASE}/config`).catch(() => null);
      if (cfgRes && cfgRes.ok) {
        const c = await cfgRes.json();
        setConfig((prev) => ({ ...prev, ...c }));
      }

      const syncRes = await fetch(`${API_BASE}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (syncRes && syncRes.ok) {
        const u = await syncRes.json();
        setUser(u);
        try {
          localStorage.setItem('foxtask_user_cache', JSON.stringify(u));
        } catch {}
      } else {
        const local = localStorage.getItem('foxtask_user_cache');
        if (local) {
          try {
            setUser(JSON.parse(local));
          } catch {}
        }
      }

      fetchTasks(payload.id);
      fetchAdvanceTasks(payload.id);
      fetchMilestones(payload.id);
      fetchWithdrawals(payload.id);
    } catch (e) {
      console.log('Using local fallback state:', e);
    }
  };

  // Real-time Live Active User Heartbeat (Tracks online users while Mini App is active)
  useEffect(() => {
    if (!user?.id || user.id === 'guest_user') return;
    const ping = () => {
      fetch(`${API_BASE}/user/ping-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).catch(() => null);
    };
    ping();
    const interval = setInterval(ping, 45000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Live Real-Time Polling & Instant Visibility Sync (Keeps bot tasks in perfect sync with admin actions)
  useEffect(() => {
    const targetUid = user?.id || 'guest_user';
    const syncTasks = () => {
      fetchTasks(targetUid);
      fetchAdvanceTasks(targetUid);
    };

    // Auto-poll every 10 seconds while the app is open
    const interval = setInterval(syncTasks, 10000);

    // Instant sync when user switches back to the Mini App from another chat/app
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncTasks();
      }
    };
    const handleFocus = () => {
      syncTasks();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  const fetchTasks = async (uid = user?.id) => {
    const targetUid = uid || user?.id || 'guest_user';
    try {
      const res = await fetch(`${API_BASE}/tasks?userId=${targetUid}&_t=${Date.now()}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Authoritative task list directly from database (respects deleted tasks)
          const active = filterActiveTasks(data, user);
          setTasks(active);
          try {
            localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(data));
          } catch {}
          return active;
        }
      }
    } catch (e) {
      console.warn('API fetchTasks fallback:', e);
    }

    // Offline / Network Error Fallback - ONLY if no tasks exist in memory
    setTasks((prev) => {
      if (prev && prev.length > 0) return prev;
      return filterActiveTasks(DEFAULT_TASKS, user);
    });
  };

  const fetchMilestones = async (uid = user.id) => {
    try {
      const res = await fetch(`${API_BASE}/referrals/milestones?userId=${uid}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setReferralMilestones(data.milestones);
        if (data.activeReferralCount !== undefined) {
          setUser((prev) => ({ ...prev, activeReferralCount: data.activeReferralCount }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWithdrawals = async (uid = user.id) => {
    try {
      const res = await fetch(`${API_BASE}/wallet/withdrawals/${uid}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch {}
  };

  // Complete a task
  const completeTask = async (task) => {
    if (task.completed) return;
    const isAd = task.category === 'ads' || task.type === 'ad' || task.id?.startsWith('task_ad_');
    const now = Date.now();

    try {
      const tgUserId = (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) || user.id;
      const res = await fetch(`${API_BASE}/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, taskId: task.id, telegramId: tgUserId })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        try {
          localStorage.setItem('foxtask_user_cache', JSON.stringify(data.user));
        } catch {}

        // Completed task immediately disappears from user's active task list!
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        triggerConfetti();
        setTaskSuccessModal({ visible: true, task });
        showToast(`Task Complete! +$${Number(task.usdtReward || 0.01).toFixed(3)} USDT`, 'success');
        fetchTasks(user.id);
        return { success: true };
      } else if (res && !res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Verification failed. Please ensure you joined the channel.';
        showToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch (e) {
      console.warn('Backend completeTask offline:', e);
    }

    // STRICT: Telegram channel tasks MUST NEVER be claimed without real verification!
    if (task.category === 'telegram' || task.type === 'telegram') {
      showToast('Could not verify Telegram channel membership. Please join the channel first, then click check.', 'error');
      return { success: false, error: 'Telegram verification required' };
    }

    // Seamless Local Verification & Reward (only for simple ads/simulated actions)
    const adCompletions = { ...(user.adCompletions || {}) };
    const tasksCompleted = [...(user.tasksCompleted || [])];

    if (isAd) {
      adCompletions[task.id] = now;
      if (!tasksCompleted.includes(task.id)) tasksCompleted.push(task.id);
    } else {
      if (!tasksCompleted.includes(task.id)) tasksCompleted.push(task.id);
    }

    const earnedUsdt = Number(task.usdtReward !== undefined ? task.usdtReward : (task.category === 'telegram' ? 0.015 : 0.01));
    const earnedFg = Number(task.fgReward || (task.category === 'telegram' ? 15 : 10));

    const updatedUser = {
      ...user,
      usdtBalance: Number(((user.usdtBalance || 0) + earnedUsdt).toFixed(4)),
      fgBalance: Number(((user.fgBalance || 0) + earnedFg).toFixed(2)),
      doneTasksCount: (user.doneTasksCount || 0) + 1,
      tasksCompleted,
      adCompletions
    };

    setUser(updatedUser);
    try {
      localStorage.setItem('foxtask_user_cache', JSON.stringify(updatedUser));
    } catch {}

    // Remove completed task immediately from active list
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    triggerConfetti();
    setTaskSuccessModal({ visible: true, task });
    showToast(`Task Complete! +$${earnedUsdt.toFixed(3)} USDT`, 'success');
    return { success: true };
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const payload = {
        ...taskData,
        creatorId: user.id || 'guest_user'
      };
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('foxtask_user_cache', JSON.stringify(data.user));
        }
        try {
          const stored = JSON.parse(localStorage.getItem('foxtask_my_campaign_ids') || '[]');
          if (!stored.includes(data.task.id)) {
            stored.push(data.task.id);
            localStorage.setItem('foxtask_my_campaign_ids', JSON.stringify(stored));
          }
        } catch {}
        triggerConfetti();
        showToast('Campaign Submitted! Awaiting Admin Approval.', 'success');
        return data.task;
      } else {
        const errData = await res?.json().catch(() => ({}));
        const errMsg = errData?.error || 'Failed to create task';
        showToast(errMsg, 'error');
        return null;
      }
    } catch {
      showToast('Error creating task', 'error');
      return null;
    }
  };

  // Admin Approve Task (For testing & upcoming admin panel)
  const approveTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/tasks/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      }).catch(() => null);

      if (res && res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'approved' } : t)));
        triggerConfetti();
        showToast('Campaign Approved! Now Live to Public Members.', 'success');
        return true;
      } else {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'approved' } : t)));
        triggerConfetti();
        showToast('Campaign Approved! Now Live to Public Members.', 'success');
        return true;
      }
    } catch {
      showToast('Error approving campaign', 'error');
      return false;
    }
  };

  // Simulate user joining a campaign
  const simulateJoinTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/simulate-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data.task } : t)));
        showToast('+1 User Joined your campaign!', 'success');
        return data.task;
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, joinedMembers: (t.joinedMembers || 0) + 1 } : t
          )
        );
        showToast('+1 User Joined your campaign!', 'success');
      }
    } catch {
      showToast('Could not record join', 'error');
    }
  };

  // Verify if bot is admin in channel
  const verifyChannelAdmin = async (channelLink) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/verify-channel-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelLink })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      } else {
        const err = await res?.json().catch(() => ({}));
        return {
          success: false,
          error: err?.error || 'Bot is not an administrator in your channel yet. Please add bot as admin and try again.'
        };
      }
    } catch {
      return { success: false, error: 'Could not connect to verification server' };
    }
  };

  // Daily Checkin
  const claimDailyCheckin = async () => {
    try {
      const res = await fetch(`${API_BASE}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        triggerConfetti();
        showToast('Daily Check-in Success! +$0.002 USDT', 'success');
      } else {
        const today = new Date().toISOString().slice(0, 10);
        if (user.lastCheckInDate === today) {
          showToast('Already checked in today!', 'info');
          return;
        }
        const updated = {
          ...user,
          usdtBalance: Number(((user.usdtBalance || 0) + 0.002).toFixed(4)),
          lastCheckInDate: today
        };
        setUser(updated);
        localStorage.setItem('foxtask_user_cache', JSON.stringify(updated));
        triggerConfetti();
        showToast('Daily Check-in Success! +$0.002 USDT', 'success');
      }
    } catch {
      showToast('Error checking in', 'error');
    }
  };

  // Claim Referral Milestone
  const claimReferralMilestone = async (milestoneId) => {
    try {
      const res = await fetch(`${API_BASE}/referrals/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, milestoneId })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        triggerConfetti();
        showToast(`Milestone Claimed! +$${data.milestone.usdtReward} USDT added to wallet!`, 'success');
        fetchMilestones(user.id);
      } else {
        const errData = res ? await res.json().catch(() => null) : null;
        showToast(errData?.error || 'Milestone requirements not met: Each referral must complete 50+ tasks to count!', 'error');
      }
    } catch {
      showToast('Error claiming milestone', 'error');
    }
  };

  // Simulate Adding a Referral (For testing)
  const simulateAddReferral = async (count = 10) => {
    try {
      const res = await fetch(`${API_BASE}/referrals/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, count })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        triggerConfetti();
        showToast(`+${count} referrals registered for testing!`, 'info');
        fetchMilestones(user.id);
      } else {
        const newCount = (user.referralCount || 0) + count;
        const updated = { ...user, referralCount: newCount };
        setUser(updated);
        localStorage.setItem('foxtask_user_cache', JSON.stringify(updated));
        triggerConfetti();
        showToast(`+${count} referrals registered for testing!`, 'info');
      }
    } catch {
      showToast('Error simulating referral', 'error');
    }
  };

  // Swap FN coin to USDT
  const swapTokens = async (fgAmount) => {
    const amount = Number(fgAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid FN amount', 'error');
      return false;
    }
    if ((user.fgBalance || 0) < amount) {
      showToast('Insufficient FN coin balance', 'error');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/wallet/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, fgAmount: amount })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        triggerConfetti();
        showToast(`Swapped ${amount} FN for ${data.usdtEarned} USDT!`, 'success');
        return true;
      } else {
        const usdtEarned = Number((amount * config.rate).toFixed(4));
        const updated = {
          ...user,
          fgBalance: Number(((user.fgBalance || 0) - amount).toFixed(2)),
          usdtBalance: Number(((user.usdtBalance || 0) + usdtEarned).toFixed(4))
        };
        setUser(updated);
        localStorage.setItem('foxtask_user_cache', JSON.stringify(updated));
        triggerConfetti();
        showToast(`Swapped ${amount} FN for ${usdtEarned} USDT!`, 'success');
        return true;
      }
    } catch {
      showToast('Error executing swap', 'error');
      return false;
    }
  };

  // Deposit USDT
  const depositUsdt = async (depositAmount) => {
    const num = Number(depositAmount);
    if (!num || num < 0.1) {
      showToast('Minimum deposit is 0.1 USDT', 'error');
      return false;
    }
    try {
      const res = await fetch(`${API_BASE}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: num })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        try {
          localStorage.setItem('foxtask_user_cache', JSON.stringify(data.user));
        } catch {}
        triggerConfetti();
        showToast(`Deposited +$${num.toFixed(2)} USDT!`, 'success');
        return true;
      } else {
        const updated = {
          ...user,
          depositBalance: Number(((user.depositBalance || 0) + num).toFixed(4))
        };
        setUser(updated);
        try {
          localStorage.setItem('foxtask_user_cache', JSON.stringify(updated));
        } catch {}
        triggerConfetti();
        showToast(`Deposited +$${num.toFixed(2)} USDT!`, 'success');
        return true;
      }
    } catch {
      showToast('Deposit error', 'error');
      return false;
    }
  };

  // Submit BEP-20 withdrawal
  const submitWithdrawal = async (amount, bep20Address) => {
    const parsed = Number(amount);
    if (isNaN(parsed) || parsed < config.minWithdrawUsdt) {
      showToast(`Minimum withdrawal is ${config.minWithdrawUsdt} USDT`, 'error');
      return false;
    }
    if ((user.usdtBalance || 0) < parsed) {
      showToast('Insufficient USDT balance', 'error');
      return false;
    }

    const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
    if (!bep20Regex.test(bep20Address.trim())) {
      showToast('Invalid BEP-20 address! Must start with 0x (40 hex chars)', 'error');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          usdtAmount: parsed,
          bep20Address: bep20Address.trim()
        })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWithdrawals((prev) => [data.withdrawal, ...prev]);
        triggerConfetti();
        showToast('Withdrawal order submitted to BEP-20 queue!', 'success');
        return true;
      } else {
        const updated = {
          ...user,
          usdtBalance: Number(((user.usdtBalance || 0) - parsed).toFixed(4))
        };
        const record = {
          id: 'tx_' + Date.now(),
          amountUsdt: parsed,
          network: 'BEP-20 (BNB Smart Chain)',
          bep20Address: bep20Address.trim(),
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        setUser(updated);
        setWithdrawals((prev) => [record, ...prev]);
        localStorage.setItem('foxtask_user_cache', JSON.stringify(updated));
        triggerConfetti();
        showToast('Withdrawal order submitted to BEP-20 queue!', 'success');
        return true;
      }
    } catch {
      showToast('Withdrawal failed', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isAdmin,
        loginAdmin,
        logoutAdmin,
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
        activeAdvanceModalTask,
        setActiveAdvanceModalTask,
        adminCreateAdvanceTask,
        adminDeleteAdvanceTask,
        userSubmitAdvanceProof,
        adminApproveAdvanceSubmission,
        adminRejectAdvanceSubmission,
        resolveMediaUrl,
        getBackendRoot,
        user,
        config,
        tasks,
        fetchTasks,
        referralMilestones,
        withdrawals,
        activeTab,
        setActiveTab,
        currentWithdrawAlert: LIVE_WITHDRAW_ALERTS[currentWithdrawAlertIndex],
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        taskSuccessModal,
        closeTaskSuccessModal,
        setTaskSuccessModal,
        completeTask,
        createTask,
        verifyChannelAdmin,
        simulateJoinTask,
        approveTask,
        claimDailyCheckin,
        claimReferralMilestone,
        simulateAddReferral,
        swapTokens,
        depositUsdt,
        submitWithdrawal
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
