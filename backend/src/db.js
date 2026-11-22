import pg from 'pg';
import { CONFIG } from './config.js';
import { runMigration } from './migrate.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: CONFIG.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  keepAlive: true
});

// Helper formatting functions
function formatUser(row, tasksCompleted = []) {
  if (!row) return null;
  return {
    id: String(row.id),
    username: row.username || 'Member',
    firstName: row.first_name || 'Member',
    photoUrl: row.photo_url || '/default_user.png',
    photo_url: row.photo_url || '/default_user.png',
    level: row.level || 'LV.1',
    rankTitle: row.rank_title || '',
    memberNumber: row.member_number || '#802,793',
    referralCode: row.referral_code || ('ref_' + String(row.id).slice(-6)),
    referredBy: row.referred_by || null,
    referralCount: Number(row.referral_count || 0),
    activeReferralCount: row.active_referral_count !== undefined ? Number(row.active_referral_count) : 0,
    referralUsdtEarned: Number(parseFloat(row.referral_usdt_earned || 0).toFixed(4)),
    claimedMilestones: Array.isArray(row.claimed_milestones) ? row.claimed_milestones : [],
    usdtBalance: Number(parseFloat(row.usdt_balance || 0).toFixed(4)),
    withdrawBalance: Number(parseFloat(row.usdt_balance || 0).toFixed(2)),
    depositBalance: Number(parseFloat(row.deposit_balance || 0).toFixed(2)),
    claimedChannelBonus: Boolean(row.claimed_channel_bonus),
    totalBetsCount: Number(row.total_bets_count || 0),
    totalBetAmount: Number(parseFloat(row.total_bet_amount || 0).toFixed(2)),
    totalWonAmount: Number(parseFloat(row.total_won_amount || 0).toFixed(2)),
    fgBalance: Number(parseFloat(row.fg_balance || 0).toFixed(2)),
    novaBalance: Number(parseFloat(row.fg_balance || 0).toFixed(2)),
    doneTasksCount: Number(row.done_tasks_count || 0),
    tasksCompleted: tasksCompleted,
    lastCheckInDate: row.last_check_in_date || null,
    adCompletions: typeof row.ad_completions === 'object' && row.ad_completions !== null ? row.ad_completions : {},
    allAdsCompletedAt: row.all_ads_completed_at ? Number(row.all_ads_completed_at) : null,
    lastAdminAdjustment: row.last_admin_adjustment || null,
    createdAt: row.created_at
  };
}

function formatTask(row, completed = false) {
  if (!row) return null;
  return {
    id: String(row.id),
    creatorId: row.creator_id ? String(row.creator_id) : null,
    title: row.title,
    isVerified: Boolean(row.is_verified),
    hasGlobe: Boolean(row.has_globe),
    usdtReward: Number(parseFloat(row.usdt_reward || 0).toFixed(4)),
    fgReward: Number(parseFloat(row.fg_reward || 0).toFixed(2)),
    totalCostUsdt: Number(parseFloat(row.total_cost_usdt || 0).toFixed(4)),
    participants: Number(row.participants || 100),
    joinedMembers: Number(row.joined_members || 0),
    joinedUserIds: Array.isArray(row.joined_user_ids) ? row.joined_user_ids : [],
    code: row.code || '',
    category: row.category || 'telegram',
    type: row.type || row.category || 'telegram',
    badge: row.badge || 'auto',
    link: row.link || '',
    description: row.description || '',
    status: row.status || 'approved',
    rejectReason: row.reject_reason || '',
    createdAt: row.created_at,
    completed: Boolean(completed)
  };
}

function formatWithdrawal(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    amountUsdt: Number(parseFloat(row.amount_usdt || 0).toFixed(4)),
    network: row.network || 'BEP-20 (BNB Smart Chain)',
    bep20Address: row.bep20_address,
    status: row.status,
    txHash: row.tx_hash || '',
    rejectReason: row.reject_reason || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Enriched User Profile Details for Admin Review
    username: row.username || null,
    firstName: row.first_name || 'Member',
    remainingUsdtBalance: Number(parseFloat(row.usdt_balance || 0).toFixed(4)),
    remainingDepositBalance: Number(parseFloat(row.deposit_balance || 0).toFixed(2)),
    remainingFgBalance: Number(row.fg_balance || 0),
    doneTasksCount: Number(row.done_tasks_count || 0),
    prevPaidCount: Number(row.prev_paid_count || 0),
    prevPaidTotalUsdt: Number(parseFloat(row.prev_paid_total || 0).toFixed(2)),
    prevRejectedCount: Number(row.prev_rejected_count || 0)
  };
}

function formatBroadcast(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    message: row.message,
    url: row.url || '',
    active: Boolean(row.active),
    createdAt: row.created_at
  };
}

function formatAdvanceTask(row, userSubmission = null) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    instructions: row.instructions || '',
    link: row.link || '',
    usdtReward: Number(parseFloat(row.usdt_reward || 0).toFixed(4)),
    fgReward: Number(parseFloat(row.fg_reward || 0).toFixed(2)),
    participants: Number(row.participants || 100),
    completedCount: Number(row.completed_count || 0),
    code: row.code || '',
    category: row.category || 'advance',
    isVerified: Boolean(row.is_verified),
    status: row.status || 'active',
    createdAt: row.created_at,
    userSubmission: userSubmission ? {
      id: String(userSubmission.id),
      status: userSubmission.status,
      rejectReason: userSubmission.reject_reason || '',
      createdAt: userSubmission.created_at
    } : null
  };
}

function formatAdvanceTaskSubmission(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    taskTitle: row.task_title || '',
    taskInstructions: row.task_instructions || '',
    taskLink: row.task_link || '',
    taskUsdtReward: Number(parseFloat(row.task_usdt_reward || 0).toFixed(4)),
    taskFgReward: Number(parseFloat(row.task_fg_reward || 0).toFixed(2)),
    userId: String(row.user_id),
    username: row.username || '',
    firstName: row.first_name || '',
    screenshotUrl: row.screenshot_url || '',
    screenshotFilename: row.screenshot_filename || '',
    status: row.status || 'pending',
    rejectReason: row.reject_reason || '',
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at
  };
}

// Live in-memory Active User Session Tracker
const activeUserSessions = new Map();

export function trackUserActive(userId) {
  if (userId && String(userId) !== 'guest_user' && String(userId) !== 'undefined' && String(userId) !== 'null') {
    activeUserSessions.set(String(userId), Date.now());
  }
}

export function getLiveActiveUsersCount() {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [uid, lastTime] of activeUserSessions.entries()) {
    if (lastTime < cutoff) {
      activeUserSessions.delete(uid);
    }
  }
  return activeUserSessions.size;
}

class Database {
  constructor() {
    this.initPromise = this.init();
  }

  async init() {
    try {
      await runMigration();
      console.log('[Neon DB] Ready & connected.');
    } catch (err) {
      console.error('[Neon DB Init Error]:', err.message);
    }
  }

  async query(text, params) {
    await this.initPromise;
    return pool.query(text, params);
  }

  // 1. User
  async getUser(userId) {
    const id = String(userId || 'guest_user');
    await this.initPromise;

    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    let userRow = res.rows[0];

    if (!userRow) {
      const defaultUser = id === '5977573271' ? 'lkgjdfjklgndefs56df4' : ('user_' + id.slice(-6));
      const defaultName = id === '5977573271' ? 'Alamin [ɴᴇᴠᴇʀ ᴅᴍ ꜰɪʀꜱᴛ]' : 'Member';
      const insertRes = await pool.query(`
        INSERT INTO users (
          id, username, first_name, photo_url, level, rank_title, member_number,
          referral_code, referral_count, referral_usdt_earned, claimed_milestones,
          usdt_balance, deposit_balance, fg_balance, done_tasks_count,
          last_check_in_date, ad_completions, created_at
        ) VALUES (
          $1, $2, $3, '/default_user.png', 'LV.1', '', '#802,793',
          $4, 0, 0, '[]'::jsonb, 0, 0, 0, 0, NULL, '{}'::jsonb, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
        RETURNING *
      `, [id, defaultUser, defaultName, 'ref_' + id.slice(-6)]);
      userRow = insertRes.rows[0];
    }

    // 24-hour Auto-reset for Ads
    const COOLDOWN_24H = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const allAdsCompletedAt = userRow.all_ads_completed_at ? Number(userRow.all_ads_completed_at) : null;
    let adCompletions = typeof userRow.ad_completions === 'object' && userRow.ad_completions !== null ? { ...userRow.ad_completions } : {};

    if (allAdsCompletedAt && (now - allAdsCompletedAt >= COOLDOWN_24H)) {
      // 24 hours passed since all ads were completed -> reset for user!
      userRow.ad_completions = {};
      userRow.all_ads_completed_at = null;
      await pool.query("UPDATE users SET ad_completions = '{}'::jsonb, all_ads_completed_at = NULL WHERE id = $1", [id]);
      await pool.query("DELETE FROM task_completions WHERE user_id = $1 AND (task_id LIKE 'task_ad_%' OR task_id IN (SELECT id FROM tasks WHERE category = 'ads' OR type = 'ad'))", [id]);
    } else {
      let changed = false;
      for (const [adId, ts] of Object.entries(adCompletions)) {
        if (now - Number(ts) >= COOLDOWN_24H) {
          delete adCompletions[adId];
          changed = true;
        }
      }
      if (changed) {
        userRow.ad_completions = adCompletions;
        await pool.query('UPDATE users SET ad_completions = $1 WHERE id = $2', [JSON.stringify(adCompletions), id]);
      }
    }

    // Get completed task ids (excluding ads that are not in active 24h cooldown)
    const compRes = await pool.query('SELECT task_id FROM task_completions WHERE user_id = $1', [id]);
    const tasksCompleted = compRes.rows
      .map((r) => r.task_id)
      .filter((tId) => !tId.startsWith('task_ad_') || Boolean(userRow.ad_completions?.[tId]));

    return formatUser(userRow, tasksCompleted);
  }

  async updateUser(userId, updates = {}) {
    const id = String(userId || 'guest_user');
    await this.initPromise;

    // Ensure user exists first
    await this.getUser(id);

    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${idx++}`);
      values.push(updates.username);
    }
    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${idx++}`);
      values.push(updates.firstName);
    }
    if (updates.photoUrl !== undefined || updates.photo_url !== undefined) {
      fields.push(`photo_url = $${idx++}`);
      values.push(updates.photoUrl || updates.photo_url);
    }
    if (updates.usdtBalance !== undefined) {
      fields.push(`usdt_balance = $${idx++}`);
      values.push(updates.usdtBalance);
    }
    if (updates.depositBalance !== undefined) {
      fields.push(`deposit_balance = $${idx++}`);
      values.push(updates.depositBalance);
    }
    if (updates.fgBalance !== undefined) {
      fields.push(`fg_balance = $${idx++}`);
      values.push(updates.fgBalance);
    }
    if (updates.doneTasksCount !== undefined) {
      fields.push(`done_tasks_count = $${idx++}`);
      values.push(updates.doneTasksCount);
    }
    if (updates.lastCheckInDate !== undefined) {
      fields.push(`last_check_in_date = $${idx++}`);
      values.push(updates.lastCheckInDate);
    }
    if (updates.adCompletions !== undefined) {
      fields.push(`ad_completions = $${idx++}`);
      values.push(JSON.stringify(updates.adCompletions));
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    await pool.query(sql, values);

    return this.getUser(id);
  }

  async getAllUsers() {
    await this.initPromise;
    const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows.map((r) => formatUser(r, []));
  }

  // 2. Tasks
  async resetExpiredAdsUsers(notifyCallback) {
    await this.initPromise;
    const COOLDOWN_24H = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - COOLDOWN_24H;

    try {
      // Find all users whose 24h ads cooldown has expired
      const res = await pool.query(
        `SELECT id, username, first_name, photo_url 
         FROM users 
         WHERE all_ads_completed_at IS NOT NULL AND all_ads_completed_at <= $1`,
        [cutoff]
      );

      if (res.rows.length === 0) return 0;

      console.log(`[Ads Cooldown Engine] Found ${res.rows.length} users ready for 24h ads reset.`);

      for (const user of res.rows) {
        // Atomic update to ensure exactly-once execution
        const updateRes = await pool.query(
          `UPDATE users 
           SET ad_completions = '{}'::jsonb, all_ads_completed_at = NULL 
           WHERE id = $1 AND all_ads_completed_at IS NOT NULL
           RETURNING id`,
          [user.id]
        );

        if (updateRes.rows.length > 0) {
          // Remove ad completion records for this user
          await pool.query(
            `DELETE FROM task_completions 
             WHERE user_id = $1 AND (task_id LIKE 'task_ad_%' OR task_id IN (SELECT id FROM tasks WHERE category = 'ads' OR type = 'ad'))`,
            [user.id]
          );

          console.log(`[Ads Cooldown Engine] Reset ads tasks for user ${user.id} (${user.username || 'Member'}).`);

          // Deliver bot reminder message with "Complete Tasks" button
          if (typeof notifyCallback === 'function') {
            try {
              await notifyCallback(user.id, user);
            } catch (notifyErr) {
              console.warn(`[Ads Cooldown Engine] Notify failed for user ${user.id}:`, notifyErr.message);
            }
          }
        }
      }

      return res.rows.length;
    } catch (err) {
      console.error('[Ads Cooldown Engine Error]:', err.message);
      return 0;
    }
  }

  async getTasks(userId = 'guest_user') {
    await this.initPromise;
    const user = await this.getUser(userId);
    const now = Date.now();
    const COOLDOWN_24H = 24 * 60 * 60 * 1000;

    // Check if ALL ads were completed and 24 hours have passed -> Full reset of all ad tasks!
    if (user.allAdsCompletedAt && (now - user.allAdsCompletedAt >= COOLDOWN_24H)) {
      await pool.query(
        `DELETE FROM task_completions 
         WHERE user_id = $1 AND (task_id LIKE 'task_ad_%' OR task_id IN (SELECT id FROM tasks WHERE category = 'ads' OR type = 'ad'))`,
        [userId]
      );
      await pool.query(
        `UPDATE users SET ad_completions = '{}'::jsonb, all_ads_completed_at = NULL WHERE id = $1`,
        [userId]
      );
      user.adCompletions = {};
      user.allAdsCompletedAt = null;
    } else {
      // Check & expire individual ad cooldowns in user's ad_completions if 24h passed
      let adCompletions = user.adCompletions || {};
      let adChanged = false;
      const cleanAdCompletions = { ...adCompletions };

      for (const [adId, timestamp] of Object.entries(adCompletions)) {
        if (now - timestamp >= COOLDOWN_24H) {
          delete cleanAdCompletions[adId];
          adChanged = true;
          await pool.query('DELETE FROM task_completions WHERE user_id = $1 AND task_id = $2', [userId, adId]);
        }
      }

      if (adChanged) {
        await pool.query('UPDATE users SET ad_completions = $1 WHERE id = $2', [JSON.stringify(cleanAdCompletions), userId]);
        user.adCompletions = cleanAdCompletions;
      }
    }

    // Refresh completed tasks
    const compRes = await pool.query('SELECT task_id FROM task_completions WHERE user_id = $1', [userId]);
    const completedList = compRes.rows.map((r) => r.task_id);

    // Fetch tasks: approved tasks that have not reached participant limit (or creator's own tasks)
    // When joined_members >= participants, task is automatically excluded and disappears from bot/app!
    const taskRes = await pool.query(
      `SELECT * FROM tasks 
       WHERE (status = 'approved' AND (participants <= 0 OR participants IS NULL OR joined_members < participants)) 
          OR creator_id = $1 
       ORDER BY created_at DESC`,
      [String(userId)]
    );

    // Filter out ANY task that has been completed by this user!
    // Completed tasks disappear immediately from the user's task list!
    const activeTasks = taskRes.rows.filter((t) => {
      // 1. If user already completed this task, exclude it!
      if (completedList.includes(t.id)) {
        return false;
      }
      // 2. If it's an ad task and recorded in adCompletions within 24h, exclude it!
      const isAd = t.category === 'ads' || t.type === 'ad' || String(t.id).startsWith('task_ad_');
      if (isAd && user.adCompletions && user.adCompletions[t.id]) {
        if (now - Number(user.adCompletions[t.id]) < COOLDOWN_24H) {
          return false;
        }
      }
      return true;
    });

    const list = activeTasks.map((t) => formatTask(t, false));
    return list;
  }

  async getTask(taskId) {
    await this.initPromise;
    const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return formatTask(res.rows[0]);
  }

  async getPendingTasks() {
    await this.initPromise;
    const res = await pool.query(`SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at DESC`);
    return res.rows.map((r) => formatTask(r));
  }

  async getAllTasks() {
    await this.initPromise;
    const res = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return res.rows.map((r) => formatTask(r));
  }

  // Sequential Task Code Generator (#1, #2, #3, ...)
  async getNextTaskCode() {
    await this.initPromise;
    try {
      const res = await pool.query(`SELECT nextval('task_number_seq') as seq`);
      return `#${res.rows[0].seq}`;
    } catch {
      const countRes = await pool.query(`SELECT COUNT(*)::int as count FROM tasks`);
      return `#${(countRes.rows[0]?.count || 0) + 1}`;
    }
  }

  // Sequential Advance Task Code Generator (#ADV-1, #ADV-2, ...)
  async getNextAdvanceTaskCode() {
    await this.initPromise;
    try {
      const res = await pool.query(`SELECT nextval('advance_task_number_seq') as seq`);
      return `#ADV-${res.rows[0].seq}`;
    } catch {
      const countRes = await pool.query(`SELECT COUNT(*)::int as count FROM advance_tasks`);
      return `#ADV-${(countRes.rows[0]?.count || 0) + 1}`;
    }
  }

  async createTask(taskData) {
    await this.initPromise;
    const userId = String(taskData.creatorId || taskData.userId || 'guest_user');
    const user = await this.getUser(userId);

    const targetMembers = Math.max(100, Number(taskData.participants) || 100);
    const usdtReward = taskData.usdtReward !== undefined && !isNaN(Number(taskData.usdtReward)) ? Number(taskData.usdtReward) : 0.005;
    const fgReward = taskData.fgReward !== undefined && !isNaN(Number(taskData.fgReward)) ? Number(taskData.fgReward) : 5;

    const isUsdt = usdtReward > 0;
    const totalCostUsdt = isUsdt
      ? Number((targetMembers * usdtReward).toFixed(4))
      : Number(((targetMembers * fgReward) * 0.001).toFixed(4));

    const availableDeposit = Number(user.depositBalance || 0);
    const availableEarn = Number(user.usdtBalance || 0);
    const totalAvailable = Number((availableDeposit + availableEarn).toFixed(4));

    if (totalAvailable < totalCostUsdt) {
      throw new Error(`Insufficient balance to create task. Required: $${totalCostUsdt.toFixed(2)} USDT. Available: $${totalAvailable.toFixed(2)} USDT (Topup: $${availableDeposit.toFixed(2)} + Earned: $${availableEarn.toFixed(2)}). Please deposit to publish.`);
    }

    // Deduct cost: priority from Topup Balance, then from Earned Balance
    const deductDeposit = Math.min(availableDeposit, totalCostUsdt);
    const deductEarn = Number((totalCostUsdt - deductDeposit).toFixed(4));

    const taskId = 'task_' + Date.now();
    const code = taskData.code || await this.getNextTaskCode();
    const status = taskData.status || (String(userId) === '5977573271' ? 'approved' : 'pending');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduct from Topup Balance and Earned Balance
      await client.query(`
        UPDATE users
        SET deposit_balance = deposit_balance - $1,
            usdt_balance = usdt_balance - $2,
            updated_at = NOW()
        WHERE id = $3
      `, [deductDeposit, deductEarn, userId]);

      // Insert task
      const insertRes = await client.query(`
        INSERT INTO tasks (
          id, creator_id, title, is_verified, has_globe, usdt_reward, fg_reward,
          total_cost_usdt, participants, joined_members, joined_user_ids,
          code, category, type, link, description, status, badge, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW())
        RETURNING *
      `, [
        taskId, userId, taskData.title?.trim() || 'New Sponsored Task',
        Boolean(taskData.isVerified), Boolean(taskData.hasGlobe),
        usdtReward, fgReward, totalCostUsdt, targetMembers, 0,
        JSON.stringify([]), code, taskData.category || 'telegram',
        taskData.category || 'telegram', taskData.link?.trim() || 'https://t.me',
        taskData.description?.trim() || '', status, taskData.badge || 'auto'
      ]);

      await client.query('COMMIT');

      const updatedUser = await this.getUser(userId);
      return { task: formatTask(insertRes.rows[0]), user: updatedUser };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async approveTask(taskId) {
    await this.initPromise;
    const res = await pool.query(`UPDATE tasks SET status = 'approved' WHERE id = $1 RETURNING *`, [taskId]);
    if (!res.rows[0]) throw new Error('Task not found');
    return formatTask(res.rows[0]);
  }

  async rejectTask(taskId, reason) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fetchRes = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [taskId]);
      if (!fetchRes.rows[0]) throw new Error('Task not found');
      const task = fetchRes.rows[0];

      // Calculate unused USDT: total_cost_usdt - (joined_members * reward_per_member)
      const costPerMember = Number(task.usdt_reward) > 0 ? Number(task.usdt_reward) : Number(task.fg_reward || 0) * 0.001;
      const joinedCount = Number(task.joined_members || 0);
      const totalCost = Number(task.total_cost_usdt || 0);
      const usedCost = Number((joinedCount * costPerMember).toFixed(4));
      const unusedRefund = Math.max(0, Number((totalCost - usedCost).toFixed(4)));

      const res = await client.query(`
        UPDATE tasks
        SET status = 'rejected', reject_reason = $1
        WHERE id = $2
        RETURNING *
      `, [reason || 'Declined by Administrator', taskId]);

      // Refund unused balance to creator's topup (deposit) balance
      if (unusedRefund > 0 && task.creator_id && task.creator_id !== 'admin' && task.creator_id !== 'system') {
        await client.query(`
          UPDATE users
          SET deposit_balance = deposit_balance + $1,
              updated_at = NOW()
          WHERE id = $2
        `, [unusedRefund, task.creator_id]);
      }

      await client.query('COMMIT');
      return { task: formatTask(res.rows[0]), unusedRefund, creatorId: task.creator_id };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteTask(taskId) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fetchRes = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [taskId]);
      if (!fetchRes.rows[0]) throw new Error('Task not found');
      const task = fetchRes.rows[0];

      // Calculate unused USDT to refund back to creator's topup (deposit) balance
      const costPerMember = Number(task.usdt_reward) > 0 ? Number(task.usdt_reward) : Number(task.fg_reward || 0) * 0.001;
      const joinedCount = Number(task.joined_members || 0);
      const totalCost = Number(task.total_cost_usdt || 0);
      const usedCost = Number((joinedCount * costPerMember).toFixed(4));
      const unusedRefund = Math.max(0, Number((totalCost - usedCost).toFixed(4)));

      if (unusedRefund > 0 && task.creator_id && task.creator_id !== 'admin' && task.creator_id !== 'system') {
        await client.query(`
          UPDATE users
          SET deposit_balance = deposit_balance + $1,
              updated_at = NOW()
          WHERE id = $2
        `, [unusedRefund, task.creator_id]);
      }

      // Delete task completions and task
      await client.query('DELETE FROM task_completions WHERE task_id = $1', [taskId]);
      const res = await client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);

      await client.query('COMMIT');
      return { task: formatTask(res.rows[0] || task), unusedRefund, creatorId: task.creator_id };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async createAdminTask(taskData) {
    await this.initPromise;
    const taskId = 'task_' + Date.now();
    const code = taskData.code || await this.getNextTaskCode();
    const usdtReward = taskData.usdtReward !== undefined && !isNaN(Number(taskData.usdtReward)) ? Number(taskData.usdtReward) : 0.015;
    const fgReward = taskData.fgReward !== undefined && !isNaN(Number(taskData.fgReward)) ? Number(taskData.fgReward) : 15;
    const participants = Math.max(1, Number(taskData.participants) || 100);

    const res = await pool.query(`
      INSERT INTO tasks (
        id, creator_id, title, is_verified, has_globe, usdt_reward, fg_reward,
        total_cost_usdt, participants, joined_members, joined_user_ids,
        code, category, type, link, description, status, badge, created_at
      ) VALUES ($1, 'admin', $2, $3, $4, $5, $6, $7, $8, 0, '[]'::jsonb, $9, $10, $11, $12, $13, 'approved', $14, NOW())
      RETURNING *
    `, [
      taskId,
      taskData.title?.trim() || 'New Admin Task',
      taskData.isVerified !== undefined ? Boolean(taskData.isVerified) : true,
      Boolean(taskData.hasGlobe),
      usdtReward,
      fgReward,
      0,
      participants,
      code,
      taskData.category || 'telegram',
      taskData.type || taskData.category || 'telegram',
      taskData.link?.trim() || '',
      taskData.description?.trim() || '',
      taskData.badge || 'auto'
    ]);

    return formatTask(res.rows[0]);
  }

  async editAdminTask(taskId, taskData) {
    await this.initPromise;
    const fields = [];
    const values = [];
    let idx = 1;

    if (taskData.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(taskData.title.trim());
    }
    if (taskData.link !== undefined) {
      fields.push(`link = $${idx++}`);
      values.push(taskData.link.trim());
    }
    if (taskData.usdtReward !== undefined) {
      fields.push(`usdt_reward = $${idx++}`);
      values.push(Number(taskData.usdtReward));
    }
    if (taskData.fgReward !== undefined) {
      fields.push(`fg_reward = $${idx++}`);
      values.push(Number(taskData.fgReward));
    }
    if (taskData.participants !== undefined) {
      fields.push(`participants = $${idx++}`);
      values.push(Math.max(1, Number(taskData.participants)));
    }
    if (taskData.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(taskData.status);
    }
    if (taskData.isVerified !== undefined) {
      fields.push(`is_verified = $${idx++}`);
      values.push(Boolean(taskData.isVerified));
    }
    if (taskData.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(taskData.category);
      fields.push(`type = $${idx++}`);
      values.push(taskData.category);
    }
    if (taskData.badge !== undefined) {
      fields.push(`badge = $${idx++}`);
      values.push(taskData.badge);
    }

    if (fields.length === 0) return this.getTask(taskId);

    values.push(taskId);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(sql, values);
    if (!res.rows[0]) throw new Error('Task not found');
    return formatTask(res.rows[0]);
  }

  async setTaskStatus(taskId, status) {
    await this.initPromise;
    const res = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, taskId]
    );
    if (!res.rows[0]) throw new Error('Task not found');
    return formatTask(res.rows[0]);
  }

  async setTaskBadge(codeOrId, badge) {
    await this.initPromise;
    let clean = String(codeOrId || '').trim();
    const validBadge = ['new', 'limited', 'auto'].includes(String(badge).toLowerCase())
      ? String(badge).toLowerCase()
      : 'auto';

    let res = await pool.query(
      `UPDATE tasks SET badge = $1 WHERE id = $2 OR LOWER(code) = LOWER($2) RETURNING *`,
      [validBadge, clean]
    );

    if (res.rows.length === 0 && !clean.startsWith('#')) {
      res = await pool.query(
        `UPDATE tasks SET badge = $1 WHERE LOWER(code) = LOWER($2) RETURNING *`,
        [validBadge, '#' + clean]
      );
    }

    if (res.rows.length === 0) return null;
    return formatTask(res.rows[0]);
  }

  async completeTask(userId, taskId) {
    await this.initPromise;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch task with lock
      const taskRes = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [taskId]);
      if (!taskRes.rows[0]) throw new Error('Task not found');
      const taskRow = taskRes.rows[0];

      // Check if task is already completed/closed by reaching participant limit
      const currentJoined = Number(taskRow.joined_members || 0);
      const targetParticipants = Number(taskRow.participants || 0);
      if (taskRow.status === 'completed' || (targetParticipants > 0 && currentJoined >= targetParticipants)) {
        throw new Error('This task has reached its target participant limit and is now closed.');
      }

      // Fetch user with lock
      const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (!userRes.rows[0]) throw new Error('User not found');
      const userRow = userRes.rows[0];

      const isAd = taskRow.category === 'ads' || taskRow.type === 'ad' || taskRow.id.startsWith('task_ad_');
      const COOLDOWN_24H = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const adCompletions = userRow.ad_completions || {};
      let newAllAdsCompletedAt = userRow.all_ads_completed_at ? Number(userRow.all_ads_completed_at) : null;

      if (isAd) {
        // If 24h passed since all ads were completed, clear the cooldown
        if (newAllAdsCompletedAt && (now - newAllAdsCompletedAt >= COOLDOWN_24H)) {
          newAllAdsCompletedAt = null;
        }

        // If all ads were completed and still in 24h cooldown, reject
        if (newAllAdsCompletedAt && (now - newAllAdsCompletedAt < COOLDOWN_24H)) {
          const remainingHours = Math.ceil((COOLDOWN_24H - (now - newAllAdsCompletedAt)) / (1000 * 60 * 60));
          throw new Error(`All ads completed for today! New ads will be available in ${remainingHours} hours.`);
        }

        // Check if this specific ad was completed within the last 24h
        if (adCompletions[taskId] && (now - Number(adCompletions[taskId]) < COOLDOWN_24H)) {
          throw new Error('This ad was already completed today. It will be available again tomorrow!');
        }

        adCompletions[taskId] = now;

        // Check if ALL remaining active ads are completed now
        const allAdsRes = await client.query(
          "SELECT id FROM tasks WHERE (category = 'ads' OR type = 'ad' OR id LIKE 'task_ad_%') AND status = 'approved' AND (participants <= 0 OR participants IS NULL OR joined_members < participants)"
        );
        const allAdIds = allAdsRes.rows.map(r => r.id);
        const allDone = allAdIds.length > 0 && allAdIds.every(id => (adCompletions[id] && (now - Number(adCompletions[id]) < COOLDOWN_24H)) || id === taskId);
        if (allDone) {
          newAllAdsCompletedAt = now;
        }
      } else {
        // Check duplicate completion
        const checkRes = await client.query(
          'SELECT id FROM task_completions WHERE user_id = $1 AND task_id = $2',
          [userId, taskId]
        );
        if (checkRes.rows.length > 0) {
          throw new Error('Task already completed');
        }
      }

      // Insert completion
      await client.query(`
        INSERT INTO task_completions (user_id, task_id, completed_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id, task_id) DO UPDATE SET completed_at = NOW()
      `, [userId, taskId]);

      // Update user balances
      const usdtReward = Number(parseFloat(taskRow.usdt_reward || 0));
      const fgReward = Number(parseFloat(taskRow.fg_reward || 0));

      await client.query(`
        UPDATE users
        SET usdt_balance = usdt_balance + $1,
            fg_balance = fg_balance + $2,
            done_tasks_count = done_tasks_count + 1,
            ad_completions = $3,
            all_ads_completed_at = $4,
            updated_at = NOW()
        WHERE id = $5
      `, [usdtReward, fgReward, JSON.stringify(adCompletions), newAllAdsCompletedAt, userId]);

      // 5% Referral Commission on task completion (USDT only, no FN coins)
      let referrerCommission = null;
      if (userRow.referred_by && String(userRow.referred_by) !== String(userId)) {
        const commUsdt = Number((usdtReward * 0.05).toFixed(4));
        const commFg = 0;

        if (commUsdt > 0) {
          await client.query(`
            UPDATE users
            SET usdt_balance = usdt_balance + $1,
                referral_usdt_earned = referral_usdt_earned + $1,
                updated_at = NOW()
            WHERE id = $2
          `, [commUsdt, userRow.referred_by]);

          referrerCommission = {
            referrerId: userRow.referred_by,
            commUsdt,
            commFg: 0
          };
        }
      }

      // Update task participants and auto-complete when limit is reached
      const newJoined = currentJoined + 1;
      const isNowCompleted = targetParticipants > 0 && newJoined >= targetParticipants;

      await client.query(`
        UPDATE tasks
        SET joined_members = joined_members + 1,
            joined_user_ids = joined_user_ids || jsonb_build_array($1::text),
            status = CASE WHEN $2::boolean THEN 'completed' ELSE status END
        WHERE id = $3
      `, [String(userId), isNowCompleted, taskId]);

      await client.query('COMMIT');

      const updatedUser = await this.getUser(userId);
      const updatedTask = await this.getTask(taskId);
      return { user: updatedUser, task: updatedTask, referrerCommission };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async simulateJoin(taskId) {
    await this.initPromise;
    const simUserId = 'sim_user_' + Date.now();
    const res = await pool.query(`
      UPDATE tasks
      SET joined_members = joined_members + 1,
          joined_user_ids = joined_user_ids || jsonb_build_array($1::text)
      WHERE id = $2
      RETURNING *
    `, [simUserId, taskId]);
    return formatTask(res.rows[0]);
  }

  // 3. Daily Check-in
  async claimDailyCheckin(userId) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (!userRes.rows[0]) throw new Error('User not found');
      const user = userRes.rows[0];

      const today = new Date().toISOString().slice(0, 10);
      if (user.last_check_in_date === today) {
        throw new Error('Daily check-in already claimed today!');
      }

      await client.query(`
        UPDATE users
        SET last_check_in_date = $1,
            usdt_balance = usdt_balance + 0.002,
            updated_at = NOW()
        WHERE id = $2
      `, [today, userId]);

      await client.query('COMMIT');

      const updatedUser = await this.getUser(userId);
      return { user: updatedUser, reward: 0.002, currency: 'USDT' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // 4. Referral Milestones
  async getReferralMilestones(userId = 'guest_user') {
    await this.initPromise;
    const user = await this.getUser(userId);

    // Active referrals: invited members who completed at least 50 tasks!
    const activeRes = await pool.query(`
      SELECT COUNT(*)::int as count 
      FROM users 
      WHERE referred_by = $1 AND done_tasks_count >= 50
    `, [String(userId)]);
    const activeReferralCount = activeRes.rows[0]?.count || 0;

    const mRes = await pool.query('SELECT * FROM referral_milestones ORDER BY required ASC');

    const claimedList = user.claimedMilestones || [];
    const milestones = mRes.rows.map((m) => ({
      id: m.id,
      title: m.title,
      required: Number(m.required),
      usdtReward: Number(parseFloat(m.usdt_reward).toFixed(4)),
      fgReward: Number(parseFloat(m.fg_reward).toFixed(2)),
      claimed: claimedList.includes(m.id),
      canClaim: activeReferralCount >= m.required && !claimedList.includes(m.id),
      currentCount: activeReferralCount
    }));

    return {
      milestones,
      referralCount: user.referralCount || 0,
      activeReferralCount,
      referralUsdtEarned: user.referralUsdtEarned || 0,
      referralCode: user.referralCode || `ref_${user.id}`
    };
  }

  async claimReferralMilestone(userId, milestoneId) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const mRes = await client.query('SELECT * FROM referral_milestones WHERE id = $1', [milestoneId]);
      if (!mRes.rows[0]) throw new Error('Milestone not found');
      const milestone = mRes.rows[0];

      const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (!userRes.rows[0]) throw new Error('User not found');
      const user = userRes.rows[0];

      const claimed = user.claimed_milestones || [];
      if (claimed.includes(milestoneId)) {
        throw new Error('Milestone reward already claimed!');
      }

      // Active referrals check: must have completed at least 50 tasks
      const activeRes = await client.query(`
        SELECT COUNT(*)::int as count 
        FROM users 
        WHERE referred_by = $1 AND done_tasks_count >= 50
      `, [String(userId)]);
      const activeReferralCount = activeRes.rows[0]?.count || 0;

      if (activeReferralCount < milestone.required) {
        throw new Error(`Requires ${milestone.required} active referrals (members who completed at least 50 tasks). Current: ${activeReferralCount}`);
      }

      const usdtReward = Number(parseFloat(milestone.usdt_reward || 0));
      const fgReward = Number(parseFloat(milestone.fg_reward || 0));

      await client.query(`
        UPDATE users
        SET claimed_milestones = claimed_milestones || jsonb_build_array($1::text),
            usdt_balance = usdt_balance + $2,
            fg_balance = fg_balance + $3,
            referral_usdt_earned = referral_usdt_earned + $2,
            updated_at = NOW()
        WHERE id = $4
      `, [milestoneId, usdtReward, fgReward, userId]);

      await client.query('COMMIT');
      const updatedUser = await this.getUser(userId);
      return { user: updatedUser, milestone };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async addReferral(userId, count = 1) {
    await this.initPromise;
    await pool.query(`
      UPDATE users
      SET referral_count = referral_count + $1,
          updated_at = NOW()
      WHERE id = $2
    `, [count, userId]);
    return this.getUser(userId);
  }

  // Track Telegram Bot / WebApp Referral Link with automatic count increment
  async trackReferral(userId, refParam) {
    if (!userId || !refParam) return { tracked: false, reason: 'missing_params' };
    await this.initPromise;

    const uId = String(userId);
    const cleanRef = String(refParam).trim().replace(/^ref_/, '');

    // 1. Check if user is already referred
    const userRes = await pool.query('SELECT id, referred_by FROM users WHERE id = $1', [uId]);
    if (userRes.rows[0]?.referred_by) {
      return { tracked: false, reason: 'already_referred', referredBy: userRes.rows[0].referred_by };
    }

    // 2. Lookup referrer by referral_code or id
    const refRes = await pool.query(`
      SELECT id, username, first_name, referral_count
      FROM users
      WHERE referral_code = $1 OR referral_code = $2 OR id = $3 OR id = $4
    `, [refParam, 'ref_' + cleanRef, cleanRef, refParam]);

    const referrer = refRes.rows[0];
    if (!referrer || String(referrer.id) === uId) {
      return { tracked: false, reason: 'invalid_referrer' };
    }

    // 3. Attach referrer and increment referrer's count
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        UPDATE users
        SET referred_by = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [referrer.id, uId]);

      // Increment referral count (5% lifetime USDT commission earned on task completions)
      await client.query(`
        UPDATE users
        SET referral_count = referral_count + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [referrer.id]);

      // Record in referrals table
      await client.query(`
        INSERT INTO referrals (referrer_id, referred_id, referred_username, reward_amount, created_at)
        VALUES ($1, $2, $3, 0.00, NOW())
      `, [referrer.id, uId, userRes.rows[0]?.username || ('user_' + uId.slice(-4))]);

      await client.query('COMMIT');

      return {
        tracked: true,
        referrerId: referrer.id,
        referrerName: referrer.first_name || referrer.username
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.warn('[trackReferral Error]:', err.message);
      return { tracked: false, error: err.message };
    } finally {
      client.release();
    }
  }

  // Get Top Users Leaderboard (Sorted by Referrals or Total Balance)
  async getTopUsers(type = 'referrals', limit = 50) {
    await this.initPromise;
    const lim = Math.min(100, Math.max(1, Number(limit) || 50));

    if (type === 'balance') {
      const res = await pool.query(`
        SELECT id, username, first_name, photo_url, level,
               referral_code, referred_by, referral_count, referral_usdt_earned,
               usdt_balance, deposit_balance, fg_balance, done_tasks_count, created_at
        FROM users
        ORDER BY (usdt_balance + deposit_balance) DESC, usdt_balance DESC
        LIMIT $1
      `, [lim]);
      return res.rows.map((r) => formatUser(r));
    } else {
      const res = await pool.query(`
        SELECT id, username, first_name, photo_url, level,
               referral_code, referred_by, referral_count, referral_usdt_earned,
               usdt_balance, deposit_balance, fg_balance, done_tasks_count, created_at
        FROM users
        ORDER BY referral_count DESC, referral_usdt_earned DESC, done_tasks_count DESC
        LIMIT $1
      `, [lim]);
      return res.rows.map((r) => formatUser(r));
    }
  }

  // 5. Wallet (Deposit, Swap, Withdraw)
  async depositUsdt(userId, amount) {
    await this.initPromise;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0.1) throw new Error('Minimum deposit is 0.1 USDT');

    await pool.query(`
      UPDATE users
      SET deposit_balance = deposit_balance + $1,
          updated_at = NOW()
      WHERE id = $2
    `, [numAmount, userId]);

    const user = await this.getUser(userId);
    return { user, depositedUsdt: numAmount };
  }

  // Relay Deposit Sessions (Neon DB)
  async getDepositById(depositId) {
    if (!depositId) return null;
    await this.initPromise;
    const res = await pool.query('SELECT * FROM deposits WHERE id = $1 LIMIT 1', [String(depositId)]);
    return res.rows[0] || null;
  }

  async getActiveDepositSession(userId, network) {
    await this.initPromise;
    const res = await pool.query(`
      SELECT * FROM deposits
      WHERE user_id = $1 AND network = $2 AND status = 'waiting'
        AND created_at > NOW() - INTERVAL '45 minutes'
      ORDER BY created_at DESC
      LIMIT 1
    `, [String(userId), String(network)]);
    return res.rows[0] || null;
  }

  async saveDepositSession(userId, network, depositAddress, requestId, amountUsdt = 0) {
    await this.initPromise;
    const id = 'dep_' + Date.now();
    const res = await pool.query(`
      INSERT INTO deposits (id, user_id, network, deposit_address, amount_usdt, request_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'waiting', NOW(), NOW())
      RETURNING *
    `, [id, String(userId), String(network), String(depositAddress), Number(amountUsdt), String(requestId || '')]);
    return res.rows[0];
  }

  async confirmDeposit(depositId, creditedUsdt) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const depRes = await client.query('SELECT * FROM deposits WHERE id = $1 FOR UPDATE', [depositId]);
      if (!depRes.rows[0]) throw new Error('Deposit order not found');
      const deposit = depRes.rows[0];

      if (deposit.status === 'success') {
        await client.query('COMMIT');
        const user = await this.getUser(deposit.user_id);
        return { user, deposit, alreadyCredited: true };
      }

      const amount = Number(creditedUsdt || deposit.amount_usdt || 0.1);

      // Update deposit status
      const updatedDep = await client.query(`
        UPDATE deposits
        SET status = 'success', amount_usdt = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [amount, depositId]);

      // Credit user deposit balance
      await client.query(`
        UPDATE users
        SET deposit_balance = deposit_balance + $1, updated_at = NOW()
        WHERE id = $2
      `, [amount, deposit.user_id]);

      await client.query('COMMIT');
      const user = await this.getUser(deposit.user_id);
      return { user, deposit: updatedDep.rows[0], alreadyCredited: false };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async swapTokens(userId, fgAmount, rate = 0.001) {
    await this.initPromise;
    const amount = Number(fgAmount);
    if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query('SELECT fg_balance, usdt_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (!res.rows[0]) throw new Error('User not found');

      const currentFg = Number(parseFloat(res.rows[0].fg_balance || 0));
      if (currentFg < amount) throw new Error('Insufficient FN coin balance');

      const usdtEarned = Number((amount * rate).toFixed(4));

      await client.query(`
        UPDATE users
        SET fg_balance = fg_balance - $1,
            usdt_balance = usdt_balance + $2,
            updated_at = NOW()
        WHERE id = $3
      `, [amount, usdtEarned, userId]);

      await client.query('COMMIT');
      const updatedUser = await this.getUser(userId);
      return { user: updatedUser, swappedFg: amount, usdtEarned };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async createWithdrawal(userId, usdtAmount, bep20Address) {
    await this.initPromise;
    const amount = Number(usdtAmount);
    if (isNaN(amount) || amount <= 0) throw new Error('Invalid USDT amount');

    const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
    if (!bep20Regex.test(bep20Address.trim())) {
      throw new Error('Invalid BEP-20 address format! Must start with 0x followed by 40 hex characters.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query('SELECT usdt_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (!res.rows[0]) throw new Error('User not found');

      const currentUsdt = Number(parseFloat(res.rows[0].usdt_balance || 0));
      if (currentUsdt < amount) {
        throw new Error(`Insufficient Earned USDT balance. Available for withdrawal: $${currentUsdt.toFixed(2)} USDT. Note: Topup balance is reserved for task creation and cannot be withdrawn.`);
      }

      // Deduct exclusively from Earned balance (usdt_balance)
      await client.query('UPDATE users SET usdt_balance = usdt_balance - $1, updated_at = NOW() WHERE id = $2', [amount, userId]);

      // Insert withdrawal
      const id = 'tx_' + Date.now();
      const insertRes = await client.query(`
        INSERT INTO withdrawals (
          id, user_id, amount_usdt, network, bep20_address, status, created_at, updated_at
        ) VALUES ($1, $2, $3, 'BEP-20 (BNB Smart Chain)', $4, 'pending', NOW(), NOW())
        RETURNING *
      `, [id, userId, amount, bep20Address.trim()]);

      await client.query('COMMIT');
      const user = await this.getUser(userId);
      return { user, withdrawal: formatWithdrawal(insertRes.rows[0]) };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getUserWithdrawals(userId) {
    await this.initPromise;
    const res = await pool.query('SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows.map((r) => formatWithdrawal(r));
  }

  async getAllWithdrawals() {
    await this.initPromise;
    const query = `
      SELECT 
        w.*,
        u.username,
        u.first_name,
        u.usdt_balance,
        u.deposit_balance,
        u.fg_balance,
        COALESCE(u.done_tasks_count, 0) as done_tasks_count,
        COALESCE(prev_w.prev_paid_count, 0) as prev_paid_count,
        COALESCE(prev_w.prev_paid_total, 0) as prev_paid_total,
        COALESCE(prev_w.prev_rejected_count, 0) as prev_rejected_count
      FROM withdrawals w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) FILTER (WHERE status IN ('paid', 'completed')) as prev_paid_count,
          COALESCE(SUM(amount_usdt) FILTER (WHERE status IN ('paid', 'completed')), 0) as prev_paid_total,
          COUNT(*) FILTER (WHERE status = 'rejected') as prev_rejected_count
        FROM withdrawals
        GROUP BY user_id
      ) prev_w ON w.user_id = prev_w.user_id
      ORDER BY w.created_at DESC
    `;
    const res = await pool.query(query);
    return res.rows.map((r) => formatWithdrawal(r));
  }

  async updateWithdrawalStatus(withdrawalId, status, txHash = '', reason = '') {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query('SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE', [withdrawalId]);
      if (!res.rows[0]) throw new Error('Withdrawal order not found');
      const w = res.rows[0];

      const prevStatus = w.status;
      const updateRes = await client.query(`
        UPDATE withdrawals
        SET status = $1, tx_hash = $2, reject_reason = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [status, txHash || w.tx_hash, reason || w.reject_reason, withdrawalId]);

      // If rejected from pending, refund USDT to user
      if (status === 'rejected' && prevStatus !== 'rejected') {
        await client.query(`
          UPDATE users
          SET usdt_balance = usdt_balance + $1, updated_at = NOW()
          WHERE id = $2
        `, [w.amount_usdt, w.user_id]);
      }

      await client.query('COMMIT');
      return formatWithdrawal(updateRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // 6. Admin Actions
  async adjustUserBalance(userId, usdtDelta = 0, fgDelta = 0, note = '', depositDelta = 0) {
    await this.initPromise;
    const adjustment = {
      usdtDelta: Number(usdtDelta) || 0,
      fgDelta: Number(fgDelta) || 0,
      depositDelta: Number(depositDelta) || 0,
      note,
      date: new Date().toISOString()
    };

    await pool.query(`
      UPDATE users
      SET usdt_balance = GREATEST(0, usdt_balance + $1),
          fg_balance = GREATEST(0, fg_balance + $2),
          deposit_balance = GREATEST(0, deposit_balance + $3),
          last_admin_adjustment = $4,
          updated_at = NOW()
      WHERE id = $5
    `, [Number(usdtDelta) || 0, Number(fgDelta) || 0, Number(depositDelta) || 0, JSON.stringify(adjustment), String(userId)]);

    return this.getUser(userId);
  }

  async saveBroadcast(broadcastData) {
    await this.initPromise;
    const id = 'bc_' + Date.now();
    const res = await pool.query(`
      INSERT INTO broadcasts (id, title, message, url, active, created_at)
      VALUES ($1, $2, $3, $4, TRUE, NOW())
      RETURNING *
    `, [id, broadcastData.title?.trim() || 'Official Announcement', broadcastData.message?.trim() || '', broadcastData.url?.trim() || '']);
    return formatBroadcast(res.rows[0]);
  }

  async getBroadcasts() {
    await this.initPromise;
    const res = await pool.query('SELECT * FROM broadcasts ORDER BY created_at DESC');
    return res.rows.map((r) => formatBroadcast(r));
  }

  trackUserActive(userId) {
    trackUserActive(userId);
  }

  getLiveActiveUsersCount() {
    return getLiveActiveUsersCount();
  }

  async getAdminStats() {
    await this.initPromise;
    const [uRes, wRes, tRes] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE id NOT IN ('guest_user', 'undefined', 'null')) as total_users, 
          COALESCE(SUM(referral_count), 0) as total_referrals,
          COALESCE(SUM(usdt_balance), 0) as total_earned_balance
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status IN ('completed', 'paid')) as completed_count,
          COALESCE(SUM(amount_usdt) FILTER (WHERE status IN ('completed', 'paid')), 0) as total_paid
        FROM withdrawals
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_campaigns,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_campaigns,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_campaigns
        FROM tasks
      `)
    ]);

    const u = uRes.rows[0];
    const w = wRes.rows[0];
    const t = tRes.rows[0];

    const totalUsers = parseInt(u.total_users || 0);
    const realEarned = parseFloat(u.total_earned_balance || 0);
    const totalPaid = parseFloat(w.total_paid || 0);
    const totalTaskEarnedUsdt = Number(realEarned.toFixed(2));

    return {
      totalUsers,
      liveActiveUsers: getLiveActiveUsersCount(),
      totalReferrals: parseInt(u.total_referrals || 0),
      totalTaskEarnedUsdt,
      pendingWithdrawalsCount: parseInt(w.pending_count || 0),
      completedWithdrawalsCount: parseInt(w.completed_count || 0),
      totalPaidUsdt: Number(totalPaid.toFixed(2)),
      pendingCampaignsCount: parseInt(t.pending_campaigns || 0),
      approvedCampaignsCount: parseInt(t.approved_campaigns || 0),
      totalCampaigns: parseInt(t.total_campaigns || 0)
    };
  }

  async searchUser(query) {
    await this.initPromise;
    const rawQ = String(query || '').trim();
    const q = rawQ.replace(/^@/, '');
    if (!q) return null;

    // Search by ID, username, referral code, or partial match
    let res = await pool.query(`
      SELECT * FROM users
      WHERE id = $1 OR LOWER(username) = LOWER($1) OR referral_code = $1 OR referral_code = $2
      LIMIT 1
    `, [q, 'ref_' + q]);

    if (!res.rows[0]) {
      const likeQ = `%${q.toLowerCase()}%`;
      res = await pool.query(`
        SELECT * FROM users
        WHERE LOWER(username) LIKE $1 OR LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [likeQ]);
    }

    if (!res.rows[0]) return null;

    const baseUser = formatUser(res.rows[0]);
    const userId = String(baseUser.id);

    // 1. Fetch Referrals & Active Referrals (tasks >= 50)
    const refRes = await pool.query(`
      SELECT u.id, u.username, u.first_name, u.created_at,
             COUNT(tc.task_id) as done_tasks_count
      FROM users u
      LEFT JOIN task_completions tc ON tc.user_id = u.id
      WHERE u.referred_by = $1 OR u.referred_by = $2
      GROUP BY u.id, u.username, u.first_name, u.created_at
      ORDER BY u.created_at DESC
    `, [userId, baseUser.referralCode || 'ref_' + userId]);

    const referralsList = refRes.rows.map(r => ({
      id: r.id,
      username: r.username,
      firstName: r.first_name,
      createdAt: r.created_at,
      doneTasksCount: parseInt(r.done_tasks_count || 0),
      isActive: parseInt(r.done_tasks_count || 0) >= 50
    }));

    const totalReferrals = referralsList.length;
    const activeReferralsCount = referralsList.filter(r => r.isActive).length;

    // 2. Fetch Referrer Info (who invited this user)
    let referrerInfo = null;
    if (baseUser.referredBy) {
      const parentQ = baseUser.referredBy.replace(/^ref_/, '');
      const parentRes = await pool.query(`
        SELECT id, username, first_name FROM users
        WHERE id = $1 OR referral_code = $1 OR referral_code = $2 OR LOWER(username) = LOWER($1)
        LIMIT 1
      `, [parentQ, baseUser.referredBy]);
      if (parentRes.rows[0]) {
        referrerInfo = {
          id: parentRes.rows[0].id,
          username: parentRes.rows[0].username,
          firstName: parentRes.rows[0].first_name
        };
      }
    }

    // 3. Fetch Completed Tasks stats & recent
    const compRes = await pool.query(`
      SELECT tc.task_id, tc.completed_at, t.title, t.category
      FROM task_completions tc
      LEFT JOIN tasks t ON t.id = tc.task_id
      WHERE tc.user_id = $1
      ORDER BY tc.completed_at DESC
      LIMIT 10
    `, [userId]);

    const totalCompletedTasksCount = await pool.query(`
      SELECT COUNT(*) as cnt FROM task_completions WHERE user_id = $1
    `, [userId]);

    // 4. Fetch Recent Withdrawals
    const withRes = await pool.query(`
      SELECT * FROM withdrawals
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    // 5. Fetch Recent Deposits
    const depRes = await pool.query(`
      SELECT * FROM deposits
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    // 6. Fetch Recent Advance Task Submissions
    const advRes = await pool.query(`
      SELECT ats.*, at.title as task_title, at.usdt_reward, at.fg_reward
      FROM advance_task_submissions ats
      LEFT JOIN advance_tasks at ON at.id = ats.task_id
      WHERE ats.user_id = $1
      ORDER BY ats.created_at DESC
      LIMIT 5
    `, [userId]);

    return {
      ...baseUser,
      totalReferrals,
      activeReferralsCount,
      referralsList: referralsList.slice(0, 10),
      referrerInfo,
      totalCompletedTasksCount: parseInt(totalCompletedTasksCount.rows[0]?.cnt || 0),
      recentTaskCompletions: compRes.rows.map(r => ({
        taskId: r.task_id,
        title: r.title || r.task_id,
        category: r.category || 'general',
        completedAt: r.completed_at
      })),
      recentWithdrawals: withRes.rows.map(formatWithdrawal),
      recentDeposits: depRes.rows.map(d => ({
        id: d.id,
        amount: parseFloat(d.amount_usdt || 0),
        network: d.network,
        status: d.status,
        depositAddress: d.deposit_address,
        createdAt: d.created_at
      })),
      recentAdvanceSubmissions: advRes.rows.map(s => ({
        id: s.id,
        taskId: s.task_id,
        taskTitle: s.task_title || s.task_id,
        rewardUsdt: parseFloat(s.usdt_reward || 0),
        rewardFg: parseFloat(s.fg_reward || 0),
        status: s.status,
        screenshotFilename: s.screenshot_filename,
        createdAt: s.created_at
      }))
    };
  }

  // 8. Advance Tasks & Screenshot Proof Submissions
  async getAdvanceTasks(userId = null) {
    await this.initPromise;
    const tasksRes = await pool.query(`SELECT * FROM advance_tasks WHERE status = 'active' ORDER BY created_at DESC`);

    let userSubmissions = new Map();
    if (userId) {
      const subRes = await pool.query(
        `SELECT * FROM advance_task_submissions WHERE user_id = $1 ORDER BY created_at DESC`,
        [String(userId)]
      );
      for (const s of subRes.rows) {
        if (!userSubmissions.has(s.task_id)) {
          userSubmissions.set(s.task_id, s);
        }
      }
    }

    return tasksRes.rows.map((r) => formatAdvanceTask(r, userSubmissions.get(r.id)));
  }

  async getAllAdvanceTasksAdmin() {
    await this.initPromise;
    const tasksRes = await pool.query(`SELECT * FROM advance_tasks ORDER BY created_at DESC`);
    return tasksRes.rows.map((r) => formatAdvanceTask(r));
  }

  async getAdvanceTask(taskId) {
    await this.initPromise;
    const res = await pool.query('SELECT * FROM advance_tasks WHERE id = $1', [taskId]);
    return formatAdvanceTask(res.rows[0]);
  }

  async createAdvanceTask(taskData) {
    await this.initPromise;
    const id = 'adv_' + Date.now();
    const code = taskData.code || await this.getNextAdvanceTaskCode();
    const usdtReward = taskData.usdtReward !== undefined && !isNaN(Number(taskData.usdtReward)) ? Number(taskData.usdtReward) : 0.5;
    const fgReward = taskData.fgReward !== undefined && !isNaN(Number(taskData.fgReward)) ? Number(taskData.fgReward) : 50;
    const participants = Math.max(1, Number(taskData.participants) || 100);

    const res = await pool.query(`
      INSERT INTO advance_tasks (
        id, title, instructions, link, usdt_reward, fg_reward, participants,
        completed_count, code, category, is_verified, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, 'advance', TRUE, 'active', NOW())
      RETURNING *
    `, [
      id,
      taskData.title?.trim() || 'New Advance Task',
      taskData.instructions?.trim() || taskData.description?.trim() || '',
      taskData.link?.trim() || '',
      usdtReward,
      fgReward,
      participants,
      code
    ]);

    return formatAdvanceTask(res.rows[0]);
  }

  async deleteAdvanceTask(taskId) {
    await this.initPromise;
    // Get submissions to return any screenshot filenames for disk deletion
    const subRes = await pool.query('SELECT screenshot_filename FROM advance_task_submissions WHERE task_id = $1', [taskId]);
    const filenames = subRes.rows.map(r => r.screenshot_filename).filter(Boolean);

    await pool.query('DELETE FROM advance_task_submissions WHERE task_id = $1', [taskId]);
    const res = await pool.query('DELETE FROM advance_tasks WHERE id = $1 RETURNING *', [taskId]);
    return { task: formatAdvanceTask(res.rows[0]), deletedFiles: filenames };
  }

  async submitAdvanceTask(taskId, userId, username, firstName, screenshotFilename, screenshotUrl) {
    await this.initPromise;
    const task = await this.getAdvanceTask(taskId);
    if (!task) throw new Error('Advance task not found');

    const subId = 'sub_' + Date.now() + '_' + Math.floor(100 + Math.random() * 900);

    // Check if user has an existing submission
    const existing = await pool.query(
      'SELECT id, status, screenshot_filename FROM advance_task_submissions WHERE task_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1',
      [taskId, String(userId)]
    );

    let oldFileToDelete = null;

    if (existing.rows[0]) {
      const prev = existing.rows[0];
      if (prev.status === 'approved') {
        throw new Error('You have already completed this task and received your reward!');
      }
      if (prev.status === 'pending') {
        throw new Error('You already have a proof submission pending admin review. Please wait for approval.');
      }
      // If rejected, allow re-submitting and replace
      oldFileToDelete = prev.screenshot_filename;
      const updateRes = await pool.query(`
        UPDATE advance_task_submissions
        SET screenshot_filename = $1, screenshot_url = $2, status = 'pending', reject_reason = NULL,
            username = $3, first_name = $4, created_at = NOW(), reviewed_at = NULL
        WHERE id = $5
        RETURNING *
      `, [screenshotFilename, screenshotUrl, username || 'Member', firstName || 'Member', prev.id]);
      return { submission: formatAdvanceTaskSubmission(updateRes.rows[0]), oldFileToDelete };
    }

    const insertRes = await pool.query(`
      INSERT INTO advance_task_submissions (
        id, task_id, user_id, username, first_name, screenshot_filename, screenshot_url, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING *
    `, [subId, taskId, String(userId), username || 'Member', firstName || 'Member', screenshotFilename, screenshotUrl]);

    return { submission: formatAdvanceTaskSubmission(insertRes.rows[0]), oldFileToDelete: null };
  }

  async getAdvanceTaskSubmissions(statusFilter = 'pending') {
    await this.initPromise;
    let query = `
      SELECT 
        s.*,
        t.title as task_title,
        t.instructions as task_instructions,
        t.link as task_link,
        t.usdt_reward as task_usdt_reward,
        t.fg_reward as task_fg_reward
      FROM advance_task_submissions s
      LEFT JOIN advance_tasks t ON s.task_id = t.id
    `;
    const params = [];
    if (statusFilter && statusFilter !== 'all') {
      query += ` WHERE s.status = $1`;
      params.push(statusFilter);
    }
    query += ` ORDER BY s.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows.map((r) => formatAdvanceTaskSubmission(r));
  }

  async approveAdvanceTaskSubmission(submissionId) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const subRes = await client.query(`
        SELECT s.*, t.title as task_title, t.usdt_reward, t.fg_reward
        FROM advance_task_submissions s
        LEFT JOIN advance_tasks t ON s.task_id = t.id
        WHERE s.id = $1
        FOR UPDATE OF s
      `, [submissionId]);

      if (!subRes.rows[0]) throw new Error('Submission not found');
      const sub = subRes.rows[0];

      if (sub.status === 'approved') {
        throw new Error('This submission has already been approved!');
      }

      const usdtReward = Number(parseFloat(sub.usdt_reward || 0));
      const fgReward = Number(parseFloat(sub.fg_reward || 0));
      const fileToDelete = sub.screenshot_filename;

      // Credit user reward balance
      await client.query(`
        UPDATE users
        SET usdt_balance = usdt_balance + $1,
            fg_balance = fg_balance + $2,
            done_tasks_count = done_tasks_count + 1,
            updated_at = NOW()
        WHERE id = $3
      `, [usdtReward, fgReward, sub.user_id]);

      // 5% Referral Commission on advance task completion
      // 5% Referral Commission on advance task completion (USDT only, no FN coins)
      let referrerCommission = null;
      const userRes = await client.query('SELECT referred_by FROM users WHERE id = $1', [sub.user_id]);
      const referredBy = userRes.rows[0]?.referred_by;
      if (referredBy && String(referredBy) !== String(sub.user_id)) {
        const commUsdt = Number((usdtReward * 0.05).toFixed(4));
        const commFg = 0;
        if (commUsdt > 0) {
          await client.query(`
            UPDATE users
            SET usdt_balance = usdt_balance + $1,
                referral_usdt_earned = referral_usdt_earned + $1,
                updated_at = NOW()
            WHERE id = $2
          `, [commUsdt, referredBy]);
          referrerCommission = { referrerId: referredBy, commUsdt, commFg: 0 };
        }
      }

      // Increment completed count on advance task
      await client.query(`
        UPDATE advance_tasks
        SET completed_count = completed_count + 1
        WHERE id = $1
      `, [sub.task_id]);

      // Mark submission approved AND REMOVE screenshot reference to keep database clean
      const updatedSubRes = await client.query(`
        UPDATE advance_task_submissions
        SET status = 'approved',
            screenshot_filename = NULL,
            screenshot_url = NULL,
            reviewed_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [submissionId]);

      await client.query('COMMIT');

      const updatedUser = await this.getUser(sub.user_id);
      return {
        submission: formatAdvanceTaskSubmission(updatedSubRes.rows[0]),
        user: updatedUser,
        usdtReward,
        fgReward,
        taskTitle: sub.task_title,
        userId: sub.user_id,
        fileToDelete,
        referrerCommission
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async rejectAdvanceTaskSubmission(submissionId, reason = '') {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const subRes = await client.query(`
        SELECT s.*, t.title as task_title
        FROM advance_task_submissions s
        LEFT JOIN advance_tasks t ON s.task_id = t.id
        WHERE s.id = $1
        FOR UPDATE OF s
      `, [submissionId]);

      if (!subRes.rows[0]) throw new Error('Submission not found');
      const sub = subRes.rows[0];
      const fileToDelete = sub.screenshot_filename;

      // Mark submission rejected AND REMOVE screenshot reference to keep database clean
      const updatedSubRes = await client.query(`
        UPDATE advance_task_submissions
        SET status = 'rejected',
            reject_reason = $1,
            screenshot_filename = NULL,
            screenshot_url = NULL,
            reviewed_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [reason || 'Proof does not match instructions', submissionId]);

      await client.query('COMMIT');

      return {
        submission: formatAdvanceTaskSubmission(updatedSubRes.rows[0]),
        taskTitle: sub.task_title,
        userId: sub.user_id,
        reason: reason || 'Proof does not match instructions',
        fileToDelete
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // 7. Aviator Game Methods
  async placeAviatorBet(userId, amount) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const uId = String(userId || 'guest_user');
      const uRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [uId]);
      if (!uRes.rows[0]) throw new Error('User not found');
      const user = uRes.rows[0];

      const depBal = Number(parseFloat(user.deposit_balance || 0));
      const withBal = Number(parseFloat(user.usdt_balance || 0));
      const totalPlayable = Number((depBal + withBal).toFixed(2));

      if (amount > totalPlayable) {
        throw new Error('Insufficient balance');
      }

      let fromDep = 0;
      let fromWith = 0;
      if (depBal >= amount) {
        fromDep = amount;
      } else {
        fromDep = depBal;
        fromWith = Number((amount - depBal).toFixed(2));
      }

      const newDep = Number((depBal - fromDep).toFixed(2));
      const newWith = Number((withBal - fromWith).toFixed(2));

      await client.query(`
        UPDATE users 
        SET deposit_balance = $1,
            usdt_balance = $2,
            total_bets_count = COALESCE(total_bets_count, 0) + 1,
            total_bet_amount = COALESCE(total_bet_amount, 0) + $3,
            updated_at = NOW()
        WHERE id = $4
      `, [newDep, newWith, amount, uId]);

      const betRes = await client.query(`
        INSERT INTO aviator_bets (
          user_id, amount, deducted_from_deposit, deducted_from_withdraw, status, created_at
        ) VALUES ($1, $2, $3, $4, 'ACTIVE', NOW())
        RETURNING *
      `, [uId, amount, fromDep, fromWith]);

      await client.query('COMMIT');
      return {
        betId: betRes.rows[0].id,
        depositBalance: newDep,
        withdrawBalance: newWith
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cashoutAviatorBet(userId, betId, multiplier) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const uId = String(userId || 'guest_user');
      const betRes = await client.query('SELECT * FROM aviator_bets WHERE id = $1 AND user_id = $2 FOR UPDATE', [betId, uId]);
      if (!betRes.rows[0]) throw new Error('Bet not found');
      const bet = betRes.rows[0];
      if (bet.status !== 'ACTIVE') throw new Error('Bet is not active');

      const betAmount = Number(parseFloat(bet.amount));
      const payout = Number((betAmount * multiplier).toFixed(2));

      // Real payout adds directly to withdrawable usdt_balance!
      const uRes = await client.query(`
        UPDATE users
        SET usdt_balance = usdt_balance + $1,
            total_won_amount = COALESCE(total_won_amount, 0) + $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING usdt_balance, deposit_balance
      `, [payout, uId]);

      await client.query(`
        UPDATE aviator_bets
        SET status = 'CASHED_OUT',
            cashed_out_multiplier = $1,
            payout = $2,
            added_to_withdraw = $2
        WHERE id = $3
      `, [multiplier, payout, betId]);

      await client.query('COMMIT');
      return {
        payout,
        withdrawBalance: Number(parseFloat(uRes.rows[0].usdt_balance || 0).toFixed(2)),
        depositBalance: Number(parseFloat(uRes.rows[0].deposit_balance || 0).toFixed(2))
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancelAviatorBet(userId, betId) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const uId = String(userId || 'guest_user');
      const betRes = await client.query('SELECT * FROM aviator_bets WHERE id = $1 AND user_id = $2 FOR UPDATE', [betId, uId]);
      if (!betRes.rows[0]) throw new Error('Bet not found');
      const bet = betRes.rows[0];
      if (bet.status !== 'ACTIVE') throw new Error('Bet is not active');

      const fromDep = Number(parseFloat(bet.deducted_from_deposit || 0));
      const fromWith = Number(parseFloat(bet.deducted_from_withdraw || 0));

      const uRes = await client.query(`
        UPDATE users
        SET deposit_balance = deposit_balance + $1,
            usdt_balance = usdt_balance + $2,
            total_bets_count = GREATEST(0, COALESCE(total_bets_count, 0) - 1),
            total_bet_amount = GREATEST(0, COALESCE(total_bet_amount, 0) - $3),
            updated_at = NOW()
        WHERE id = $4
        RETURNING usdt_balance, deposit_balance
      `, [fromDep, fromWith, Number(bet.amount), uId]);

      await client.query(`UPDATE aviator_bets SET status = 'CANCELLED' WHERE id = $1`, [betId]);

      await client.query('COMMIT');
      return {
        depositBalance: Number(parseFloat(uRes.rows[0].deposit_balance || 0).toFixed(2)),
        withdrawBalance: Number(parseFloat(uRes.rows[0].usdt_balance || 0).toFixed(2))
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async bustAviatorBet(userId, betId, crashMultiplier) {
    await this.initPromise;
    const uId = String(userId || 'guest_user');
    await pool.query(`
      UPDATE aviator_bets
      SET status = 'BUSTED',
          cashed_out_multiplier = $1
      WHERE id = $2 AND user_id = $3 AND status = 'ACTIVE'
    `, [crashMultiplier, betId, uId]);
    return { success: true };
  }

  async claimChannelBonus(userId) {
    await this.initPromise;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const uId = String(userId || 'guest_user');
      const uRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [uId]);
      if (!uRes.rows[0]) throw new Error('User not found');
      const user = uRes.rows[0];

      if (user.claimed_channel_bonus) {
        throw new Error('Channel bonus already claimed');
      }

      const updatedRes = await client.query(`
        UPDATE users
        SET deposit_balance = deposit_balance + 1.00,
            claimed_channel_bonus = TRUE,
            updated_at = NOW()
        WHERE id = $1
        RETURNING deposit_balance, usdt_balance, claimed_channel_bonus
      `, [uId]);

      await client.query('COMMIT');
      return {
        depositBalance: Number(parseFloat(updatedRes.rows[0].deposit_balance || 0).toFixed(2)),
        withdrawBalance: Number(parseFloat(updatedRes.rows[0].usdt_balance || 0).toFixed(2)),
        claimedChannelBonus: true
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAviatorStats() {
    await this.initPromise;
    const usersRes = await pool.query('SELECT COUNT(*)::int as total_users FROM users');
    const betsRes = await pool.query('SELECT COUNT(*)::int as total_bets, COALESCE(SUM(amount), 0)::numeric as total_bet_amount, COALESCE(SUM(payout), 0)::numeric as total_won_amount FROM aviator_bets');
    const winnersRes = await pool.query(`
      SELECT b.id, b.user_id, b.amount, b.cashed_out_multiplier, b.payout, b.created_at, u.username, u.first_name
      FROM aviator_bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'CASHED_OUT'
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    return {
      totalUsers: usersRes.rows[0]?.total_users || 0,
      totalBets: betsRes.rows[0]?.total_bets || 0,
      totalBetVolume: Number(parseFloat(betsRes.rows[0]?.total_bet_amount || 0).toFixed(2)),
      totalWonVolume: Number(parseFloat(betsRes.rows[0]?.total_won_amount || 0).toFixed(2)),
      recentWinners: winnersRes.rows.map(w => ({
        id: w.id,
        username: w.username ? `u***${w.username.slice(-2)}` : `u***${String(w.user_id).slice(-2)}`,
        amount: Number(parseFloat(w.amount).toFixed(2)),
        multiplier: Number(parseFloat(w.cashed_out_multiplier).toFixed(2)),
        payout: Number(parseFloat(w.payout).toFixed(2))
      }))
    };
  }

  // 8. Chat Mappings (Telegram Bot channel tracking)
  async getChatMapping(key) {
    await this.initPromise;
    const res = await pool.query('SELECT chat_id FROM chat_mappings WHERE channel_key = $1', [key.toLowerCase()]);
    return res.rows[0]?.chat_id || null;
  }

  async setChatMapping(key, chatId) {
    await this.initPromise;
    await pool.query(`
      INSERT INTO chat_mappings (channel_key, chat_id)
      VALUES ($1, $2)
      ON CONFLICT (channel_key) DO UPDATE SET chat_id = EXCLUDED.chat_id
    `, [key.toLowerCase(), String(chatId)]);
  }
}

export const db = new Database();
