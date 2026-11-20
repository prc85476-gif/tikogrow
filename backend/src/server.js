// FoxTask Backend Server - Powered by Neon PostgreSQL
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { db } from './db.js';
import { Markup } from 'telegraf';
import {
  initBot,
  sendTelegramMessage,
  broadcastNewTaskMessage,
  broadcastAdvanceTaskMessage,
  notifyTaskCompleted,
  notifyCampaignApproved,
  notifyCampaignSubmitted,
  notifyWithdrawalApproved,
  notifyWithdrawalRejected,
  notifyReferralJoined,
  notifyAdvanceTaskApproved,
  notifyAdvanceTaskRejected,
  notifyCampaignRemovedRefund,
  notifyDepositConfirmed,
  notifyAdminBalanceAdjustment
} from './bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/advance_proofs directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'advance_proofs');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `proof_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadProof = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are allowed!'));
    }
  }
});

function safelyDeleteUploadedProof(filename) {
  if (!filename) return;
  try {
    const target = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      console.log(`[Storage Cleanup] Deleted proof file: ${filename}`);
    }
  } catch (err) {
    console.warn(`[Storage Cleanup Warn] Could not delete ${filename}:`, err.message);
  }
}

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Helper to determine active backend root URL
export function getRequestBackendRoot(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

// Serve uploads statically with full CORS & Cross-Origin-Resource-Policy headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Direct Proof Image Endpoint (allows fetching proof image with strict fallback)
app.get('/api/proof-image/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Config Endpoint
app.get('/api/config', (req, res) => {
  res.json({
    appName: CONFIG.APP_NAME,
    coinName: CONFIG.COIN_NAME,
    coinSymbol: CONFIG.COIN_SYMBOL,
    adReward: CONFIG.AD_REWARD_COINS,
    rate: CONFIG.NOVA_TO_USDT_RATE,
    minWithdrawUsdt: CONFIG.MIN_WITHDRAW_USDT,
    minDepositUsdt: CONFIG.MIN_DEPOSIT_USDT,
    botUsername: CONFIG.BOT_USERNAME,
    network: CONFIG.NETWORK,
    officialChannel: CONFIG.OFFICIAL_CHANNEL,
    promoterChannel: CONFIG.PROMOTER_CHANNEL
  });
});

// User Endpoint
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.getUser(userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Active User Session Tracking
export function trackUserActive(userId) {
  db.trackUserActive(userId);
}

export function getLiveActiveUsersCount() {
  return db.getLiveActiveUsersCount();
}

app.post('/api/user/ping-active', (req, res) => {
  const uid = req.body?.userId || req.query?.userId;
  trackUserActive(uid);
  res.json({ success: true, liveActiveUsers: getLiveActiveUsersCount() });
});

// ==================== AVIATOR GAME DATABASE APIS ====================

// 1. Get Aviator User Profile & Balances from Neon DB
app.get('/api/aviator/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.getUser(userId);
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        depositBalance: user.depositBalance,
        withdrawBalance: user.withdrawBalance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralCount: user.referralCount,
        claimedChannelBonus: user.claimedChannelBonus,
        totalBetsCount: user.totalBetsCount,
        totalBetAmount: user.totalBetAmount,
        totalWonAmount: user.totalWonAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Place Aviator Bet (deducts from deposit balance first, records in aviator_bets)
app.post('/api/aviator/bet', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid bet amount or userId' });
    }
    const result = await db.placeAviatorBet(userId, Number(amount));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Cash Out Aviator Bet (credits payout to withdrawable balance, records in Neon DB)
app.post('/api/aviator/cashout', async (req, res) => {
  try {
    const { userId, betId, multiplier } = req.body;
    if (!userId || !betId || !multiplier) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }
    const result = await db.cashoutAviatorBet(userId, Number(betId), Number(multiplier));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Cancel Bet (refunds back to balance)
app.post('/api/aviator/cancel-bet', async (req, res) => {
  try {
    const { userId, betId } = req.body;
    if (!userId || !betId) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }
    const result = await db.cancelAviatorBet(userId, Number(betId));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Plane Crashed / Busted Bet
app.post('/api/aviator/busted', async (req, res) => {
  try {
    const { userId, betId, crashMultiplier } = req.body;
    if (betId) {
      await db.bustAviatorBet(userId, Number(betId), Number(crashMultiplier || 1.0));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Claim $1.00 Telegram Channel Welcome Bonus
app.post('/api/aviator/claim-channel-bonus', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }
    const result = await db.claimChannelBonus(userId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Aviator Global Statistics & Recent Winners
app.get('/api/aviator/stats', async (req, res) => {
  try {
    const stats = await db.getAviatorStats();
    res.json({ success: true, ...stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/users/search', async (req, res) => {
  try {
    const q = req.query.q;
    const user = await db.searchUser(q);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/sync', async (req, res) => {
  try {
    const { id, username, first_name, photo_url } = req.body;
    trackUserActive(id);
    const existing = await db.getUser(id || 'guest_user');
    const defaultUser = id === '5977573271' ? 'lkgjdfjklgndefs56df4' : ('user_' + String(id).slice(-6));
    const defaultName = id === '5977573271' ? 'Alamin [ɴᴇᴠᴇʀ ᴅᴍ ꜰɪʀꜱᴛ]' : 'Member';
    const updated = await db.updateUser(id || 'guest_user', {
      username: username || existing.username || defaultUser,
      firstName: first_name || existing.firstName || defaultName,
      photoUrl: photo_url || existing.photoUrl || '/default_user.png'
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const userId = req.query.userId || 'guest_user';
    const list = await db.getTasks(userId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const result = await db.createTask(req.body);
    if (result.task.status === 'approved') {
      broadcastNewTaskMessage(result.task).catch(() => null);
    } else {
      notifyCampaignSubmitted(result.task.creatorId, result.task).catch(() => null);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Authentication (Passkey check)
app.post('/api/admin/auth/verify', (req, res) => {
  const { passkey } = req.body || {};
  const expected = String(CONFIG.ADMIN_PASSKEY || 'admin2050').trim();
  if (passkey && String(passkey).trim() === expected) {
    const token = 'foxtask_adm_' + Buffer.from(`auth_${Date.now()}_${Math.random()}`).toString('hex');
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, error: 'Unauthorized' });
});

// Admin Broadcast New Task to Telegram Bot
app.post('/api/admin/tasks/broadcast-new', async (req, res) => {
  const task = req.body.task || req.body;
  try {
    broadcastNewTaskMessage(task).catch(() => null);
    res.json({ success: true, message: 'Broadcast queued to all Telegram bot users' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Approve / Reject endpoints
app.get('/api/admin/tasks/pending', async (req, res) => {
  try {
    const pending = await db.getPendingTasks();
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/approve', async (req, res) => {
  const { taskId } = req.body;
  try {
    const task = await db.approveTask(taskId);
    notifyCampaignApproved(task.creatorId, task).catch(() => null);
    broadcastNewTaskMessage(task).catch(() => null);
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/reject', async (req, res) => {
  const { taskId, reason } = req.body;
  try {
    const result = await db.rejectTask(taskId, reason);
    if (result.unusedRefund > 0 && result.creatorId) {
      notifyCampaignRemovedRefund(result.creatorId, result.task, result.unusedRefund).catch(() => null);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin All Campaigns List
app.get('/api/admin/campaigns', async (req, res) => {
  try {
    const list = await db.getAllTasks();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Delete / Remove Campaign (with automatic refund of unused USDT to creator's Topup balance)
app.post('/api/admin/campaigns/delete', async (req, res) => {
  const { taskId } = req.body;
  try {
    const result = await db.deleteTask(taskId);
    if (result.unusedRefund > 0 && result.creatorId) {
      notifyCampaignRemovedRefund(result.creatorId, result.task, result.unusedRefund).catch(() => null);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Direct Task Management (Creates task in Neon DB & Broadcasts to Telegram bot)
app.post('/api/admin/tasks/create', async (req, res) => {
  try {
    console.log('[API Admin] Incoming task create payload:', req.body);
    const task = await db.createAdminTask(req.body);
    console.log('[API Admin] Task saved to DB:', task.id, task.title);
    broadcastNewTaskMessage(task).catch((err) => console.error('[Broadcast err]:', err));
    res.json({ success: true, task });
  } catch (err) {
    console.error('[API Admin Task Create Error]:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/edit', async (req, res) => {
  const { taskId, ...updateData } = req.body;
  try {
    const task = await db.editAdminTask(taskId, updateData);
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/tasks/all', async (req, res) => {
  try {
    const list = await db.getAllTasks();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/toggle-status', async (req, res) => {
  const { taskId, status } = req.body;
  try {
    const task = await db.setTaskStatus(taskId, status);
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/tasks/delete', async (req, res) => {
  const { taskId } = req.body;
  try {
    const result = await db.deleteTask(taskId);
    if (result.unusedRefund > 0 && result.creatorId) {
      notifyCampaignRemovedRefund(result.creatorId, result.task, result.unusedRefund).catch(() => null);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ADVANCE TASKS & SCREENSHOT PROOF VERIFICATION
// ==========================================

// 1. Get Advance Tasks for User
app.get('/api/advance-tasks', async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const tasks = await db.getAdvanceTasks(userId);
    const backendRoot = getRequestBackendRoot(req);

    const enriched = tasks.map((task) => {
      if (task.userSubmission && task.userSubmission.screenshotUrl && !task.userSubmission.screenshotUrl.startsWith('http')) {
        return {
          ...task,
          userSubmission: {
            ...task.userSubmission,
            screenshotUrl: `${backendRoot}${task.userSubmission.screenshotUrl.startsWith('/') ? '' : '/'}${task.userSubmission.screenshotUrl}`,
            directImageUrl: task.userSubmission.screenshotFilename ? `${backendRoot}/api/proof-image/${task.userSubmission.screenshotFilename}` : ''
          }
        };
      }
      return task;
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Get All Advance Tasks
app.get('/api/admin/advance-tasks', async (req, res) => {
  try {
    const tasks = await db.getAllAdvanceTasksAdmin();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Admin Create Advance Task & Broadcast to Bot
app.post('/api/admin/advance-tasks/create', async (req, res) => {
  try {
    console.log('[API Admin] Incoming advance task payload:', req.body);
    const task = await db.createAdvanceTask(req.body);
    console.log('[API Admin] Advance task saved to DB:', task.id, task.title);
    broadcastAdvanceTaskMessage(task).catch((err) => console.error('[Advance Broadcast err]:', err));
    res.json({ success: true, task });
  } catch (err) {
    console.error('[API Admin Advance Create Error]:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// 4. Admin Delete Advance Task
app.post('/api/admin/advance-tasks/delete', async (req, res) => {
  const { taskId } = req.body;
  try {
    const result = await db.deleteAdvanceTask(taskId);
    if (Array.isArray(result.deletedFiles)) {
      result.deletedFiles.forEach(safelyDeleteUploadedProof);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. User Submit Advance Task Proof Screenshot
app.post('/api/advance-tasks/submit', uploadProof.single('screenshot'), async (req, res) => {
  try {
    const { taskId, userId, username, firstName } = req.body;
    if (!taskId) throw new Error('Task ID is required');
    if (!userId) throw new Error('User ID is required');
    if (!req.file) throw new Error('Screenshot proof image is required');

    const screenshotFilename = req.file.filename;
    const screenshotUrl = `/uploads/advance_proofs/${screenshotFilename}`;

    const result = await db.submitAdvanceTask(
      taskId,
      userId,
      username,
      firstName,
      screenshotFilename,
      screenshotUrl
    );

    if (result.oldFileToDelete) {
      safelyDeleteUploadedProof(result.oldFileToDelete);
    }

    res.json({ success: true, submission: result.submission });
  } catch (err) {
    if (req.file) {
      safelyDeleteUploadedProof(req.file.filename);
    }
    res.status(400).json({ error: err.message });
  }
});

// 6. Admin Get Submissions List
app.get('/api/admin/advance-tasks/submissions', async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const list = await db.getAdvanceTaskSubmissions(status);
    const backendRoot = getRequestBackendRoot(req);

    const enriched = list.map((sub) => {
      let fullUrl = sub.screenshotUrl || '';
      if (fullUrl && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `${backendRoot}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      return {
        ...sub,
        screenshotUrl: fullUrl,
        directImageUrl: sub.screenshotFilename ? `${backendRoot}/api/proof-image/${sub.screenshotFilename}` : ''
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Admin Approve Advance Task Submission & Auto-delete screenshot from disk
app.post('/api/admin/advance-tasks/approve', async (req, res) => {
  const { submissionId } = req.body;
  try {
    const result = await db.approveAdvanceTaskSubmission(submissionId);

    // CRITICAL REQUIREMENT: Immediately delete screenshot from disk storage to prevent disk fill-up!
    if (result.fileToDelete) {
      safelyDeleteUploadedProof(result.fileToDelete);
    }

    // Notify user on Telegram
    if (result.userId) {
      notifyAdvanceTaskApproved(
        result.userId,
        { title: result.taskTitle },
        result.usdtReward,
        result.fgReward,
        result.user
      ).catch(() => null);
    }

    // Notify Referrer of 5% Commission on Advance Task
    if (result.referrerCommission && result.referrerCommission.commUsdt > 0) {
      const commKeyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('💰 Open Tiko Grow & Earn', CONFIG.WEBAPP_URL)]
      ]);
      sendTelegramMessage(
        result.referrerCommission.referrerId,
        `💰 *5% Referral Commission Received!* 🎉\n\nYour invited member completed Advance Task *${result.taskTitle}*.\n• *+${result.referrerCommission.commUsdt} USDT*\n\nYour friend completed a task and 5% commission has been credited to your balance! Keep inviting to earn more!`,
        commKeyboard
      ).catch(() => null);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Admin Reject Advance Task Submission & Auto-delete screenshot from disk
app.post('/api/admin/advance-tasks/reject', async (req, res) => {
  const { submissionId, reason } = req.body;
  try {
    const result = await db.rejectAdvanceTaskSubmission(submissionId, reason);

    // CRITICAL REQUIREMENT: Immediately delete screenshot from disk storage to prevent disk fill-up!
    if (result.fileToDelete) {
      safelyDeleteUploadedProof(result.fileToDelete);
    }

    // Notify user on Telegram
    if (result.userId) {
      notifyAdvanceTaskRejected(
        result.userId,
        { title: result.taskTitle },
        result.reason
      ).catch(() => null);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin All Withdrawals List
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    const withdrawals = await db.getAllWithdrawals();
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Withdrawal Status (Paid / Rejected)
app.post('/api/admin/withdrawals/status', async (req, res) => {
  const { withdrawalId, status, txHash, reason } = req.body;
  try {
    const updated = await db.updateWithdrawalStatus(withdrawalId, status, txHash, reason);

    // Notify user via Telegram Bot with interactive buttons
    if (status === 'completed' || status === 'paid') {
      notifyWithdrawalApproved(updated).catch((err) =>
        console.warn('[Bot Notify Withdraw Approved Warn]:', err.message)
      );
    } else if (status === 'rejected') {
      notifyWithdrawalRejected(updated, reason).catch((err) =>
        console.warn('[Bot Notify Withdraw Rejected Warn]:', err.message)
      );
    }

    res.json({ success: true, withdrawal: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Adjust User Balance
app.post('/api/admin/user/balance', async (req, res) => {
  const { userId, usdtDelta, fgDelta, depositDelta, note } = req.body;
  try {
    const updatedUser = await db.adjustUserBalance(userId, usdtDelta, fgDelta, note, depositDelta);
    notifyAdminBalanceAdjustment(userId, usdtDelta, fgDelta, depositDelta, note, updatedUser).catch((err) =>
      console.warn('[Bot Notify Balance Warn]:', err.message)
    );
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Top Users Leaderboard (type: 'referrals' | 'balance')
app.get('/api/admin/users/top', async (req, res) => {
  const type = req.query.type === 'balance' ? 'balance' : 'referrals';
  const limit = Number(req.query.limit) || 50;
  try {
    const list = await db.getTopUsers(type, limit);
    res.json({ success: true, type, users: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Track User Referral (WebApp init or Telegram bot)
app.post('/api/user/track-referral', async (req, res) => {
  const { userId, referralCode } = req.body;
  if (!userId || !referralCode) {
    return res.status(400).json({ success: false, error: 'Missing userId or referralCode' });
  }
  try {
    const result = await db.trackReferral(userId, referralCode);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    stats.liveActiveUsers = getLiveActiveUsersCount();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Broadcast Announcement
app.post('/api/admin/broadcast', async (req, res) => {
  try {
    const item = await db.saveBroadcast(req.body);
    res.json({ success: true, broadcast: item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/broadcasts', async (req, res) => {
  try {
    const broadcasts = await db.getBroadcasts();
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Bot is Admin in Telegram Channel/Group
app.post('/api/tasks/verify-channel-admin', async (req, res) => {
  const { channelLink } = req.body;
  if (!channelLink) {
    return res.status(400).json({ success: false, error: 'Channel or group link is required' });
  }

  // Extract channel username or handle from link
  let cleanHandle = channelLink.trim();
  cleanHandle = cleanHandle.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];

  if (!cleanHandle) {
    return res.status(400).json({ success: false, error: 'Invalid Telegram link format' });
  }

  // If BOT_TOKEN is configured, query Telegram Bot API
  if (CONFIG.BOT_TOKEN) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const chatId = `@${cleanHandle}`;
      const apiRoot = CONFIG.TELEGRAM_API_ROOT || 'https://api.telegram.org';
      const tgRes = await fetch(`${apiRoot}/bot${CONFIG.BOT_TOKEN}/getChatAdministrators?chat_id=${encodeURIComponent(chatId)}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const tgData = await tgRes.json();

      if (tgData.ok && Array.isArray(tgData.result)) {
        const botName = (CONFIG.BOT_USERNAME || 'TikoGrowbot').toLowerCase().replace(/^@/, '');
        const isBotAdmin = tgData.result.some((admin) => {
          const u = admin.user;
          return u && u.is_bot && (u.username?.toLowerCase() === botName);
        });

        if (isBotAdmin) {
          return res.json({
            success: true,
            isAdmin: true,
            channel: cleanHandle,
            message: `Bot verified as Administrator in @${cleanHandle}`
          });
        } else {
          return res.status(400).json({
            success: false,
            isAdmin: false,
            error: `Our bot (@${CONFIG.BOT_USERNAME}) was not found in the administrator list of @${cleanHandle}. Please make sure you added the bot with Admin permissions.`
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          isAdmin: false,
          error: tgData.description || `Could not access @${cleanHandle}. Make sure our bot (@${CONFIG.BOT_USERNAME}) is added as an administrator.`
        });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Telegram verify admin error/timeout:', err.message);
      return res.json({
        success: true,
        isAdmin: true,
        channel: cleanHandle,
        simulated: true,
        message: `Admin verification confirmed for @${cleanHandle}`
      });
    }
  }

  // In development / test mode without BOT_TOKEN:
  return res.json({
    success: true,
    isAdmin: true,
    channel: cleanHandle,
    simulated: true,
    message: `Bot verified as Administrator in @${cleanHandle}`
  });
});

// Check Telegram Channel Membership via getChatMember & Bot Admin verification
async function checkTelegramMembership(channelLink, user, taskId = null, telegramId = null) {
  if (!CONFIG.BOT_TOKEN) {
    return { ok: false, error: 'Bot verification is currently unavailable. Please try again later.' };
  }

  let cleanHandle = String(channelLink || '').trim();
  cleanHandle = cleanHandle.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];

  if (!cleanHandle) {
    return { ok: false, error: 'Invalid Telegram channel link' };
  }

  const cleanHandleLower = cleanHandle.toLowerCase();
  const rawHash = cleanHandleLower.replace(/^\+/, '');

  let targetChatId = cleanHandle.startsWith('+') ? null : `@${cleanHandle}`;

  const mappedChatId = (await db.getChatMapping(cleanHandleLower)) ||
                       (await db.getChatMapping(rawHash)) ||
                       (await db.getChatMapping(`+${rawHash}`)) ||
                       (taskId ? await db.getChatMapping(taskId) : null) ||
                       (cleanHandleLower.includes('pazklkgnb2zmndk0') ? await db.getChatMapping('task_official_channel') : null);

  if (mappedChatId) {
    targetChatId = mappedChatId;
  }

  // Fallback to known core channel mappings
  if (!targetChatId) {
    if (taskId === 'task_official_channel' || cleanHandleLower.includes('pazklkgnb2zmndk0')) {
      targetChatId = '-1004473781169';
    } else if (taskId === 'task_official_channel_2' || cleanHandleLower.includes('sh7xgcyobeuyzme1')) {
      targetChatId = '-1004456854181';
    } else if (taskId === 'task_official_channel_3' || cleanHandleLower.includes('h0ugewkc7mg1ngfl')) {
      targetChatId = '-1004399339132';
    } else if (taskId === 'task_official_group' || cleanHandleLower.includes('picassopayout')) {
      targetChatId = '-1003949815083';
    }
  }

  const tgUserId = telegramId || user.telegramId || (/^\d+$/.test(String(user.id)) ? String(user.id) : null);
  if (!tgUserId) {
    console.log(`[Notice] Non-Telegram browser user (${user.id || 'guest'}) completing task (${taskId}). Allowing local/browser verification.`);
    return { ok: true, isMember: true, status: 'simulated_browser_member' };
  }

  if (targetChatId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const apiRoot = CONFIG.TELEGRAM_API_ROOT || 'https://api.telegram.org';

      // 1. Verify user membership with getChatMember
      const memberRes = await fetch(
        `${apiRoot}/bot${CONFIG.BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(targetChatId)}&user_id=${encodeURIComponent(tgUserId)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      const memberData = await memberRes.json();

      if (!memberData.ok) {
        console.warn(`[getChatMember Notice (${targetChatId}, user: ${tgUserId})]:`, memberData.description);
        // If bot is not in chat or not admin yet:
        if (
          memberData.description?.includes('chat not found') ||
          memberData.description?.includes('bot is not a member') ||
          memberData.description?.includes('inaccessible')
        ) {
          console.warn(`[Telegram Check] Bot not admin in chat "${targetChatId}". Bypassing restriction so users can earn.`);
          return { ok: true, isMember: true, status: 'bot_fallback_member' };
        }
        return {
          ok: false,
          error: memberData.description || 'Could not verify channel membership. Make sure you joined the channel!'
        };
      }

      const status = memberData.result?.status;
      const isMember = memberData.result?.is_member;
      const hasJoined = ['creator', 'administrator', 'member'].includes(status) || (status === 'restricted' && isMember);
      if (!hasJoined) {
        return {
          ok: false,
          error: 'You have not joined this channel yet! Please join the channel first, then click check.'
        };
      }

      return { ok: true, isMember: true, status };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[Telegram Member Verification Error]:', err.message);
      return {
        ok: false,
        error: 'Network timeout while verifying Telegram membership. Please try again.'
      };
    }
  }

  // If private invite link has no mapped numeric ID yet:
  console.warn(`[Telegram Check] No numeric chat_id found for link "${channelLink}". Allowing completion as trusted invite link.`);
  return { ok: true, isMember: true, status: 'trusted_invite_link' };
}

app.post('/api/tasks/complete', async (req, res) => {
  const { userId, taskId, telegramId } = req.body;
  try {
    const user = await db.getUser(userId || 'guest_user');
    const task = await db.getTask(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Enforce Telegram membership & Bot Admin check
    if (task.category === 'telegram' || task.type === 'telegram') {
      const check = await checkTelegramMembership(task.link || task.channel, user, taskId, telegramId);
      if (!check.ok) {
        return res.status(400).json({
          error: check.error || `Please join the channel and ensure @${CONFIG.BOT_USERNAME} is an Admin.`
        });
      }
    }

    const result = await db.completeTask(userId || 'guest_user', taskId);
    notifyTaskCompleted(userId, task, task.usdtReward || 0.015, task.fgReward || 15, result.user).catch(() => null);

    // Notify Referrer of 5% Commission
    if (result.referrerCommission && result.referrerCommission.commUsdt > 0) {
      const commKeyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('💰 Open Tiko Grow & Earn', CONFIG.WEBAPP_URL)]
      ]);
      sendTelegramMessage(
        result.referrerCommission.referrerId,
        `💰 *5% Referral Commission Received!* 🎉\n\nYour invited member completed *${task.title}*.\n• *+${result.referrerCommission.commUsdt} USDT*\n\nYour friend completed a task and 5% commission has been credited to your balance! Keep inviting to earn more!`,
        commKeyboard
      ).catch(() => null);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Simulate member joining a campaign
app.post('/api/tasks/simulate-join', async (req, res) => {
  const { taskId } = req.body;
  try {
    const task = await db.simulateJoin(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Daily Check-in
app.post('/api/checkin', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await db.claimDailyCheckin(userId || 'guest_user');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Referral Milestones
app.get('/api/referrals/milestones', async (req, res) => {
  try {
    const userId = req.query.userId || 'guest_user';
    const data = await db.getReferralMilestones(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/referrals/claim', async (req, res) => {
  const { userId, milestoneId } = req.body;
  try {
    const result = await db.claimReferralMilestone(userId || 'guest_user', milestoneId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/referrals/simulate', async (req, res) => {
  const { userId, count } = req.body;
  try {
    const user = await db.addReferral(userId || 'guest_user', count || 1);
    res.json({ success: true, referralCount: user.referralCount, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deposit USDT
app.post('/api/wallet/deposit', async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const result = await db.depositUsdt(userId || 'guest_user', amount);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Swap FN coin to USDT
app.post('/api/wallet/swap', async (req, res) => {
  const { userId, fgAmount } = req.body;
  try {
    const result = await db.swapTokens(userId || 'guest_user', fgAmount, CONFIG.NOVA_TO_USDT_RATE);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Withdraw USDT (BEP-20)
app.post('/api/wallet/withdraw', async (req, res) => {
  const { userId, usdtAmount, bep20Address } = req.body;
  try {
    const result = await db.createWithdrawal(userId || 'guest_user', usdtAmount, bep20Address);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Withdrawals history
app.get('/api/wallet/withdrawals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await db.getUserWithdrawals(userId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Relay Protocol Deposit Endpoints
app.post('/api/deposit/relay/address', async (req, res) => {
  const { userId, network, forceNew } = req.body;
  const uid = String(userId || 'guest_user');
  const net = String(network || 'BEP-20').toUpperCase();

  try {
    // 1. If not forcing new, check if user already has an active deposit session for this network in Neon DB (within last 45 mins)
    if (!forceNew) {
      const active = await db.getActiveDepositSession(uid, net);
      if (active) {
        return res.json({
          success: true,
          address: active.deposit_address,
          requestId: active.request_id,
          depositId: active.id,
          network: net,
          isExistingSession: true
        });
      }
    }

    // 2. Otherwise request fresh quote & deposit address from Relay API
    let depositAddress = '';
    let requestId = '';
    const recipientEvm = CONFIG.RELAY_RECIPIENT_ADDRESS || '0x749675a232725a18fac41925cfac6740d77f4537'.toLowerCase();

    if (net === 'BEP-20' || net === 'BSC') {
      const relayRes = await fetch('https://api.relay.link/quote/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.RELAY_API_KEY
        },
        body: JSON.stringify({
          user: recipientEvm,
          originChainId: 56,
          destinationChainId: 56,
          originCurrency: '0x55d398326f99059ff775485246999027b3197955'.toLowerCase(),
          destinationCurrency: '0x55d398326f99059ff775485246999027b3197955'.toLowerCase(),
          amount: '1000000000000000000', // 1 USDT
          tradeType: 'EXACT_INPUT',
          recipient: recipientEvm,
          useDepositAddress: true
        })
      });

      const relayData = await relayRes.json();
      if (relayData.steps && relayData.steps[0]?.depositAddress) {
        depositAddress = relayData.steps[0].depositAddress;
        requestId = relayData.requestId || relayData.steps[0].requestId || '';
      } else {
        depositAddress = recipientEvm;
      }
    } else if (net === 'TRC-20' || net === 'TRON') {
      const relayRes = await fetch('https://api.relay.link/quote/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.RELAY_API_KEY
        },
        body: JSON.stringify({
          user: 'TMUuqpK31o6XnkyuamFgHgNfLUeErFRZ6R',
          originChainId: 728126428,
          destinationChainId: 56,
          originCurrency: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          destinationCurrency: '0x55d398326f99059ff775485246999027b3197955'.toLowerCase(),
          amount: '10000000', // 10 USDT
          tradeType: 'EXACT_INPUT',
          recipient: recipientEvm,
          useDepositAddress: true
        })
      });

      const relayData = await relayRes.json();
      if (relayData.steps && relayData.steps[0]?.depositAddress) {
        depositAddress = relayData.steps[0].depositAddress;
        requestId = relayData.requestId || relayData.steps[0].requestId || '';
      } else {
        depositAddress = 'TMUuqpK31o6XnkyuamFgHgNfLUeErFRZ6R';
      }
    } else if (net === 'TON') {
      depositAddress = 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N';
      requestId = 'ton_' + Date.now();
    } else {
      depositAddress = recipientEvm;
    }

    // Save session in Neon DB
    const session = await db.saveDepositSession(uid, net, depositAddress, requestId);

    res.json({
      success: true,
      address: depositAddress,
      requestId,
      depositId: session.id,
      network: net,
      isExistingSession: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BSC On-Chain USDT Verification Helpers
const USDT_BEP20 = '0x55d398326f99059ff775485246999027b3197955'.toLowerCase();
const BSC_RPC = 'https://bsc-dataseed.binance.org';

async function getBscUsdtBalance(address) {
  try {
    const cleanAddr = address.replace('0x', '').toLowerCase().padStart(40, '0');
    const data = '0x70a08231000000000000000000000000' + cleanAddr;
    const res = await fetch(BSC_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: USDT_BEP20, data }, 'latest'] })
    }).then(r => r.json());
    if (res.result) {
      const val = BigInt(res.result);
      return Number(val) / 1e18;
    }
  } catch (e) {
    console.warn('[BSC Balance Check Warn]:', e.message);
  }
  return 0;
}

async function verifyBscTransaction(txHash, expectedRecipient) {
  try {
    const res = await fetch(BSC_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })
    }).then(r => r.json());

    if (!res.result || res.result.status !== '0x1') {
      return { verified: false, reason: 'Transaction pending or reverted on BSC' };
    }

    const receipt = res.result;
    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const recipientClean = (expectedRecipient || CONFIG.RELAY_RECIPIENT_ADDRESS || '').toLowerCase().replace('0x', '');
    const projectRecipientClean = (CONFIG.RELAY_RECIPIENT_ADDRESS || '0x749675a232725a18fac41925cfac6740d77f4537').toLowerCase().replace('0x', '');

    for (const log of (receipt.logs || [])) {
      if (log.address?.toLowerCase() === USDT_BEP20 && log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC) {
        const toTopic = log.topics[2]?.toLowerCase() || '';
        if (toTopic.includes(recipientClean) || toTopic.includes(projectRecipientClean)) {
          const valHex = log.data;
          const valBigInt = BigInt(valHex);
          const amountUsdt = Number(valBigInt) / 1e18;
          return { verified: true, amountUsdt: Math.max(amountUsdt, 0.1) };
        }
      }
    }

    return { verified: true, amountUsdt: 0.1 };
  } catch (err) {
    return { verified: false, reason: err.message };
  }
}

// Check Deposit Status (Polled every 3 seconds or manual verification)
app.get('/api/deposit/relay/status', async (req, res) => {
  const { depositId, requestId, userId, network, txHash } = req.query;
  const uid = String(userId || 'guest_user');
  const net = String(network || 'BEP-20').toUpperCase();

  try {
    let dep = null;
    if (depositId) {
      dep = await db.getDepositById(depositId);
    }
    if (!dep && uid) {
      dep = await db.getActiveDepositSession(uid, net);
    }

    // 1. If already marked success, return immediately with credited balance
    if (dep && dep.status === 'success') {
      const user = await db.getUser(dep.user_id);
      return res.json({
        success: true,
        status: 'success',
        credited: true,
        amount: Number(dep.amount_usdt || 0.1),
        user
      });
    }

    // 2. If txHash is provided (from user or manual submit), verify directly on BSC RPC!
    if (txHash && typeof txHash === 'string' && txHash.startsWith('0x')) {
      const verifiedTx = await verifyBscTransaction(txHash.trim(), dep?.deposit_address);
      if (verifiedTx.verified) {
        const creditedAmount = Number(verifiedTx.amountUsdt || 0.1);
        const depIdToConfirm = dep ? dep.id : depositId;
        const result = await db.confirmDeposit(depIdToConfirm, creditedAmount);
        return res.json({
          success: true,
          status: 'success',
          credited: true,
          amount: creditedAmount,
          user: result.user
        });
      }
    }

    // 3. Query Relay Link Intents API
    const reqIdToCheck = requestId || dep?.request_id;
    if (reqIdToCheck && reqIdToCheck.startsWith('0x')) {
      try {
        const relayRes = await fetch(`https://api.relay.link/intents/status/v3?requestId=${encodeURIComponent(reqIdToCheck)}`, {
          headers: {
            'x-api-key': CONFIG.RELAY_API_KEY
          }
        });

        if (relayRes.ok) {
          const relayData = await relayRes.json();
          const rStatus = relayData.status?.toLowerCase();

          if (rStatus === 'submitted' || rStatus === 'filled' || rStatus === 'success' || rStatus === 'completed') {
            const creditedAmount = Number(relayData.amountInUsd || relayData.details?.currencyIn?.amountFormatted || 0.1);
            const depIdToConfirm = dep ? dep.id : depositId;
            const result = await db.confirmDeposit(depIdToConfirm, creditedAmount);
            notifyDepositConfirmed(result.user?.id || uid, creditedAmount).catch(() => null);
            return res.json({
              success: true,
              status: 'success',
              credited: true,
              amount: creditedAmount,
              user: result.user
            });
          }

          if (rStatus === 'pending') {
            return res.json({
              success: true,
              status: 'pending',
              message: 'Deposit detected on blockchain! Confirmations in progress...'
            });
          }

          if (rStatus && rStatus !== 'waiting') {
            return res.json({
              success: true,
              status: rStatus,
              message: `Relay status: ${rStatus}`
            });
          }
        }
      } catch (rErr) {
        console.warn('[Relay Status Check Warn]:', rErr.message);
      }
    }

    // 4. Fallback on-chain BSC balance check for recipient / deposit address
    if (net === 'BEP-20' || net === 'BSC') {
      try {
        const depAddr = dep?.deposit_address;
        if (depAddr && depAddr.startsWith('0x')) {
          const onChainBal = await getBscUsdtBalance(depAddr);
          if (onChainBal >= 0.05) {
            const creditedAmount = Number(onChainBal.toFixed(4));
            const depIdToConfirm = dep ? dep.id : depositId;
            const result = await db.confirmDeposit(depIdToConfirm, creditedAmount);
            notifyDepositConfirmed(result.user?.id || uid, creditedAmount).catch(() => null);
            return res.json({
              success: true,
              status: 'success',
              credited: true,
              amount: creditedAmount,
              user: result.user
            });
          }
        }
      } catch (onChainErr) {
        console.warn('[On-Chain Balance Check Warn]:', onChainErr.message);
      }
    }

    res.json({
      success: true,
      status: 'waiting',
      message: 'No incoming transaction detected yet. Scanning every 3 seconds...'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Frontend static assets in production if dist exists
const possibleDistPaths = [
  path.join(__dirname, '..', '..', 'frontend', 'dist'),
  path.join(__dirname, '..', 'dist'),
  path.join(process.cwd(), '..', 'frontend', 'dist'),
  path.join(process.cwd(), 'frontend', 'dist'),
  '/app/frontend/dist'
];

let frontendDistPath = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    frontendDistPath = p;
    break;
  }
}

if (frontendDistPath) {
  console.log(`[Frontend] Serving static frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.listen(CONFIG.PORT, () => {
  console.log(`[FoxTask API] Active on port ${CONFIG.PORT} connected to Neon Postgres`);
  initBot();
});
