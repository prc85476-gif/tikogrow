// Tiko Grow - 24/7 Cloudflare Worker Serverless API & Telegram Bot Engine
// Eliminates dependence on local tunnels! Connects directly to Neon PostgreSQL.

const BOT_TOKEN = '9160907530:AAH4kRLPoqdt13xhJ72DtLRNudVfdRiT-o4';
const BOT_USERNAME = 'Aviatoraxalinebot';
const WEBAPP_URL = 'https://aviatorax.pages.dev';
const ADMIN_PASSKEY = 'admin2050';
const NEON_SQL_URL = 'https://ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech/sql';
const NEON_CONN_STRING = 'postgresql://neondb_owner:npg_ult1ocJR5psX@ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';
const UPDATE_CHANNEL = 'https://t.me/AirdropIdentifyOfficial';
const DISCUSSION_GROUP = 'https://t.me/picassopayout';
const COIN_NAME = 'FN coin';

// CORS response helper
function corsResponse(data, status = 200) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
      'Access-Control-Max-Age': '86400',
    }
  });
}

function corsOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
      'Access-Control-Max-Age': '86400',
    }
  });
}

// SQL literal escaping
function sqlEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// Query Neon PostgreSQL
async function neonQuery(sql) {
  const res = await fetch(NEON_SQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_CONN_STRING
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Neon SQL Error] ${res.status}: ${errText}`);
    throw new Error(`Neon SQL error: ${errText}`);
  }

  return await res.json();
}

// Call Telegram Bot API
async function sendTg(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json().catch(() => ({}));
}

function buildWebAppUrl(user) {
  const base = WEBAPP_URL;
  const sep = base.includes('?') ? '&' : '?';
  const uid = user.id;
  const name = user.first_name || '';
  const username = user.username || '';
  return `${base}${sep}tg_id=${uid}&tg_name=${encodeURIComponent(name)}&tg_user=${encodeURIComponent(username)}`;
}

// Formatters matching frontend expectations
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
    link: row.link || '',
    description: row.description || '',
    status: row.status || 'approved',
    rejectReason: row.reject_reason || '',
    createdAt: row.created_at,
    completed: Boolean(completed)
  };
}

function formatUser(row, tasksCompleted = []) {
  if (!row) return null;
  return {
    id: String(row.id),
    username: row.username || `user_${row.id}`,
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
    depositBalance: Number(parseFloat(row.deposit_balance || 0).toFixed(4)),
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

// ─────────────────────────────────────────────────────────────
// 1. API ROUTER & CONTROLLER
// ─────────────────────────────────────────────────────────────
async function handleApiRequest(request, url) {
  const method = request.method;
  const path = url.pathname.replace(/^\/api/, '');

  // 1.1 ADMIN AUTH VERIFY
  if (path === '/admin/auth/verify' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const passkey = String(body.passkey || '').trim();
    if (passkey === ADMIN_PASSKEY) {
      const token = 'foxtask_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2);
      return corsResponse({ success: true, token });
    }
    return corsResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  // 1.2 ADMIN STATS
  if (path === '/admin/stats' && method === 'GET') {
    const uRes = await neonQuery('SELECT COUNT(*)::int as total_users FROM users');
    const bRes = await neonQuery('SELECT COALESCE(SUM(usdt_balance), 0)::numeric(14,4) as total_earned FROM users');
    const totalUsers = uRes.rows?.[0]?.total_users || 0;
    const totalTaskEarnedUsdt = parseFloat(bRes.rows?.[0]?.total_earned || 0);
    return corsResponse({
      totalUsers,
      totalTaskEarnedUsdt,
      liveActiveUsers: Math.max(1, Math.floor(totalUsers * 0.12))
    });
  }

  // 1.3 CONFIG
  if (path === '/config' && method === 'GET') {
    return corsResponse({
      rate: 0.001,
      minWithdrawUsdt: 1.0,
      minDepositUsdt: 0.1,
      network: 'BEP-20 (BNB Smart Chain)'
    });
  }

  // 1.4 TASKS - ALL ADMIN TASKS
  if (path === '/admin/tasks/all' && method === 'GET') {
    const res = await neonQuery(`SELECT * FROM tasks ORDER BY created_at DESC`);
    const list = (res.rows || []).map(r => formatTask(r));
    return corsResponse(list);
  }

  // 1.5 TASKS - PUBLIC TASKS LIST
  if (path === '/tasks' && method === 'GET') {
    const userId = url.searchParams.get('userId');
    const tasksRes = await neonQuery(`SELECT * FROM tasks WHERE status = 'approved' OR status = 'completed' ORDER BY created_at DESC`);
    let completedSet = new Set();
    if (userId) {
      const compRes = await neonQuery(`SELECT task_id FROM task_completions WHERE user_id = ${sqlEscape(userId)}`);
      completedSet = new Set((compRes.rows || []).map(r => r.task_id));
    }
    const list = (tasksRes.rows || []).map(r => formatTask(r, completedSet.has(r.id)));
    return corsResponse(list);
  }

  // 1.6 ADMIN CREATE TASK
  if (path === '/admin/tasks/create' && method === 'POST') {
    const t = await request.json().catch(() => ({}));
    const id = 'task_' + Date.now();
    const title = t.title || 'Official Task';
    const link = t.link || '';
    const category = t.category || 'telegram';
    const usdtReward = Number(t.usdtReward !== undefined ? t.usdtReward : 0.015);
    const fgReward = Number(t.fgReward !== undefined ? t.fgReward : 15);
    const participants = Math.max(1, parseInt(t.participants) || 100);
    const isVerified = t.isVerified !== undefined ? Boolean(t.isVerified) : true;

    // Get next code sequence
    const seqRes = await neonQuery(`SELECT nextval('task_number_seq') as seq`).catch(() => ({ rows: [{ seq: Math.floor(Math.random() * 900) + 100 }] }));
    const code = '#' + (seqRes.rows?.[0]?.seq || Math.floor(Math.random() * 900) + 100);

    await neonQuery(`
      INSERT INTO tasks (
        id, creator_id, title, is_verified, has_globe, usdt_reward, fg_reward,
        total_cost_usdt, participants, joined_members, joined_user_ids, code,
        category, type, link, description, status, reject_reason, created_at
      ) VALUES (
        ${sqlEscape(id)}, 'admin', ${sqlEscape(title)}, ${isVerified}, FALSE,
        ${usdtReward}, ${fgReward}, 0, ${participants}, 0, '[]'::jsonb,
        ${sqlEscape(code)}, ${sqlEscape(category)}, ${sqlEscape(category)},
        ${sqlEscape(link)}, '', 'approved', '', NOW()
      )
    `);

    const created = formatTask({
      id, creator_id: 'admin', title, is_verified: isVerified, has_globe: false,
      usdt_reward: usdtReward, fg_reward: fgReward, total_cost_usdt: 0,
      participants, joined_members: 0, joined_user_ids: [], code, category,
      type: category, link, description: '', status: 'approved', reject_reason: '',
      created_at: new Date().toISOString()
    });

    // Broadcast to Telegram bot users
    try {
      const uRes = await neonQuery(`SELECT id, username FROM users WHERE id ~ '^[0-9]+$' LIMIT 100`);
      const users = uRes.rows || [];
      const broadcastText = `🆕 *New Task Available on Tiko Grow!*\n\n📋 *Task:* ${title} ${code}\n📌 *Type:* ${category === 'ads' ? 'Sponsor Video Ad' : 'Drip Task'}\n👥 *Slots:* ${participants}\n💰 *Reward:* +${usdtReward} USDT & +${fgReward} ${COIN_NAME}\n\n_Complete the task now to earn rewards!_`;

      for (const u of users) {
        sendTg('sendMessage', {
          chat_id: u.id,
          text: broadcastText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl({ id: u.id }) } }],
              [
                { text: '📢 Task Updates', url: UPDATE_CHANNEL },
                { text: '💬 Discussion', url: DISCUSSION_GROUP }
              ]
            ]
          }
        }).catch(() => null);
      }
    } catch {}

    return corsResponse({ success: true, task: created });
  }

  // 1.7 ADMIN EDIT TASK
  if (path === '/admin/tasks/edit' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { taskId, title, link, category, usdtReward, fgReward, participants } = body;
    if (!taskId) return corsResponse({ error: 'Missing taskId' }, 400);

    await neonQuery(`
      UPDATE tasks
      SET title = COALESCE(${sqlEscape(title)}, title),
          link = COALESCE(${sqlEscape(link)}, link),
          category = COALESCE(${sqlEscape(category)}, category),
          usdt_reward = COALESCE(${Number(usdtReward)}, usdt_reward),
          fg_reward = COALESCE(${Number(fgReward)}, fg_reward),
          participants = COALESCE(${Number(participants)}, participants),
          updated_at = NOW()
      WHERE id = ${sqlEscape(taskId)}
    `);
    const r = await neonQuery(`SELECT * FROM tasks WHERE id = ${sqlEscape(taskId)}`);
    return corsResponse({ success: true, task: formatTask(r.rows?.[0]) });
  }

  // 1.8 ADMIN TOGGLE TASK STATUS
  if (path === '/admin/tasks/toggle-status' && method === 'POST') {
    const { taskId, status } = await request.json().catch(() => ({}));
    await neonQuery(`UPDATE tasks SET status = ${sqlEscape(status)}, updated_at = NOW() WHERE id = ${sqlEscape(taskId)}`);
    const r = await neonQuery(`SELECT * FROM tasks WHERE id = ${sqlEscape(taskId)}`);
    return corsResponse({ success: true, task: formatTask(r.rows?.[0]) });
  }

  // 1.9 ADMIN DELETE TASK
  if (path === '/admin/tasks/delete' && method === 'POST') {
    const { taskId } = await request.json().catch(() => ({}));
    await neonQuery(`DELETE FROM task_completions WHERE task_id = ${sqlEscape(taskId)}`);
    await neonQuery(`DELETE FROM tasks WHERE id = ${sqlEscape(taskId)}`);
    return corsResponse({ success: true });
  }

  // 1.10 ADMIN BROADCAST TASK
  if (path === '/admin/tasks/broadcast-new' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const task = body.task || body;
    try {
      const uRes = await neonQuery(`SELECT id, username FROM users WHERE id ~ '^[0-9]+$' LIMIT 200`);
      const broadcastText = `🆕 *New Task Available on Tiko Grow!*\n\n📋 *Task:* ${task.title} ${task.code || ''}\n👥 *Slots:* ${task.participants || 100}\n💰 *Reward:* +${task.usdtReward || 0.015} USDT & +${task.fgReward || 15} ${COIN_NAME}\n\n_Complete the task now to earn rewards!_`;

      for (const u of (uRes.rows || [])) {
        sendTg('sendMessage', {
          chat_id: u.id,
          text: broadcastText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl({ id: u.id }) } }],
              [
                { text: '📢 Task Updates', url: UPDATE_CHANNEL },
                { text: '💬 Discussion', url: DISCUSSION_GROUP }
              ]
            ]
          }
        }).catch(() => null);
      }
    } catch {}
    return corsResponse({ success: true });
  }

  // 1.11 ADMIN WITHDRAWALS LIST
  if (path === '/admin/withdrawals' && method === 'GET') {
    const res = await neonQuery(`
      SELECT w.*, u.username, u.first_name, u.usdt_balance, u.deposit_balance, u.fg_balance, u.done_tasks_count,
             COALESCE(s.prev_paid_count, 0) as prev_paid_count,
             COALESCE(s.prev_paid_total, 0) as prev_paid_total,
             COALESCE(s.prev_rej_count, 0) as prev_rejected_count
      FROM withdrawals w
      LEFT JOIN users u ON u.id = w.user_id
      LEFT JOIN (
        SELECT user_id,
               COUNT(*) FILTER (WHERE status = 'completed' OR status = 'paid') as prev_paid_count,
               SUM(amount_usdt) FILTER (WHERE status = 'completed' OR status = 'paid') as prev_paid_total,
               COUNT(*) FILTER (WHERE status = 'rejected') as prev_rej_count
        FROM withdrawals
        GROUP BY user_id
      ) s ON s.user_id = w.user_id
      ORDER BY w.created_at DESC
    `);
    const list = (res.rows || []).map(r => formatWithdrawal(r));
    return corsResponse(list);
  }

  // 1.12 ADMIN WITHDRAWAL STATUS UPDATE & NOTIFICATION
  if (path === '/admin/withdrawals/status' && method === 'POST') {
    const { withdrawalId, status, txHash, reason } = await request.json().catch(() => ({}));
    await neonQuery(`
      UPDATE withdrawals
      SET status = ${sqlEscape(status)},
          tx_hash = ${sqlEscape(txHash || '')},
          reject_reason = ${sqlEscape(reason || '')},
          updated_at = NOW()
      WHERE id = ${sqlEscape(withdrawalId)}
    `);

    // If rejected, refund amount back to user's usdt_balance
    if (status === 'rejected') {
      const wRow = await neonQuery(`SELECT user_id, amount_usdt FROM withdrawals WHERE id = ${sqlEscape(withdrawalId)}`);
      if (wRow.rows?.[0]) {
        await neonQuery(`
          UPDATE users
          SET usdt_balance = usdt_balance + ${Number(wRow.rows[0].amount_usdt || 0)},
              updated_at = NOW()
          WHERE id = ${sqlEscape(wRow.rows[0].user_id)}
        `);
      }
    }

    const wRes = await neonQuery(`SELECT * FROM withdrawals WHERE id = ${sqlEscape(withdrawalId)}`);
    const w = wRes.rows?.[0];

    // Notify user via Telegram
    if (w && w.user_id) {
      if (status === 'completed' || status === 'paid') {
        const text = `✅ *Withdrawal Approved & Paid!* 💰\n\n• *Amount:* $${Number(w.amount_usdt).toFixed(2)} USDT\n• *Network:* ${w.network || 'BEP-20'}\n• *TxHash:* \`${w.tx_hash || 'Confirmed on-chain'}\`\n\n_Funds have been transferred to your wallet!_`;
        sendTg('sendMessage', {
          chat_id: w.user_id,
          text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl({ id: w.user_id }) } }]]
          }
        }).catch(() => null);
      } else if (status === 'rejected') {
        const text = `⚠️ *Withdrawal Request Declined*\n\n• *Amount:* $${Number(w.amount_usdt).toFixed(2)} USDT refunded\n• *Reason:* ${reason || 'Security review'}\n\n_Your funds have been refunded back to your Earned USDT Balance._`;
        sendTg('sendMessage', {
          chat_id: w.user_id,
          text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl({ id: w.user_id }) } }]]
          }
        }).catch(() => null);
      }
    }

    return corsResponse({ success: true, withdrawal: formatWithdrawal(w) });
  }

  // 1.13 ADMIN USER SEARCH (ALL DETAILS)
  if (path === '/admin/users/search' && method === 'GET') {
    const q = String(url.searchParams.get('q') || '').trim().replace(/^@/, '');
    if (!q) return corsResponse({ user: null });

    let uRes = await neonQuery(`
      SELECT * FROM users
      WHERE id = ${sqlEscape(q)} OR LOWER(username) = LOWER(${sqlEscape(q)}) OR referral_code = ${sqlEscape(q)} OR referral_code = ${sqlEscape('ref_' + q)}
      LIMIT 1
    `);

    if (!uRes.rows?.[0]) {
      const likeQ = `%${q.toLowerCase()}%`;
      uRes = await neonQuery(`
        SELECT * FROM users
        WHERE LOWER(username) LIKE ${sqlEscape(likeQ)} OR LOWER(first_name) LIKE ${sqlEscape(likeQ)}
        ORDER BY created_at DESC
        LIMIT 1
      `);
    }

    if (!uRes.rows?.[0]) return corsResponse({ user: null });
    const userRow = uRes.rows[0];
    const uid = String(userRow.id);

    // Fetch Referrals & Active Referrals (done_tasks_count >= 30)
    const refRes = await neonQuery(`
      SELECT u.id, u.username, u.first_name, u.created_at,
             COUNT(tc.task_id) as done_tasks_count
      FROM users u
      LEFT JOIN task_completions tc ON tc.user_id = u.id
      WHERE u.referred_by = ${sqlEscape(uid)} OR u.referred_by = ${sqlEscape(userRow.referral_code || 'ref_' + uid)}
      GROUP BY u.id, u.username, u.first_name, u.created_at
      ORDER BY u.created_at DESC
    `);
    const referralsList = (refRes.rows || []).map(r => ({
      id: r.id,
      username: r.username,
      firstName: r.first_name,
      createdAt: r.created_at,
      doneTasksCount: parseInt(r.done_tasks_count || 0),
      isActive: parseInt(r.done_tasks_count || 0) >= 30
    }));

    // Referrer Info
    let referrerInfo = null;
    if (userRow.referred_by) {
      const parentQ = userRow.referred_by.replace(/^ref_/, '');
      const pRes = await neonQuery(`
        SELECT id, username, first_name FROM users
        WHERE id = ${sqlEscape(parentQ)} OR referral_code = ${sqlEscape(userRow.referred_by)} OR referral_code = ${sqlEscape(parentQ)}
        LIMIT 1
      `);
      if (pRes.rows?.[0]) {
        referrerInfo = {
          id: pRes.rows[0].id,
          username: pRes.rows[0].username,
          firstName: pRes.rows[0].first_name
        };
      }
    }

    // Recent Withdrawals
    const withRes = await neonQuery(`SELECT * FROM withdrawals WHERE user_id = ${sqlEscape(uid)} ORDER BY created_at DESC LIMIT 5`);

    // Recent Deposits
    const depRes = await neonQuery(`SELECT * FROM deposits WHERE user_id = ${sqlEscape(uid)} ORDER BY created_at DESC LIMIT 5`);

    // Task completions count
    const compCount = await neonQuery(`SELECT COUNT(*) as cnt FROM task_completions WHERE user_id = ${sqlEscape(uid)}`);

    const enrichedUser = {
      ...formatUser(userRow),
      totalReferrals: referralsList.length,
      activeReferralsCount: referralsList.filter(r => r.isActive).length,
      referralsList: referralsList.slice(0, 10),
      referrerInfo,
      totalCompletedTasksCount: parseInt(compCount.rows?.[0]?.cnt || userRow.done_tasks_count || 0),
      recentWithdrawals: (withRes.rows || []).map(formatWithdrawal),
      recentDeposits: (depRes.rows || []).map(d => ({
        id: d.id,
        amount: parseFloat(d.amount_usdt || 0),
        network: d.network,
        status: d.status,
        depositAddress: d.deposit_address,
        createdAt: d.created_at
      }))
    };

    return corsResponse({ success: true, user: enrichedUser });
  }

  // 1.14 ADMIN ADJUST USER BALANCE & BOT NOTIFICATION
  if (path === '/admin/user/balance' && method === 'POST') {
    const { userId, usdtDelta, fgDelta, depositDelta, note } = await request.json().catch(() => ({}));
    if (!userId) return corsResponse({ error: 'Missing userId' }, 400);

    const uDelta = Number(usdtDelta) || 0;
    const fDelta = Number(fgDelta) || 0;
    const dDelta = Number(depositDelta) || 0;

    const adjustment = {
      usdtDelta: uDelta,
      fgDelta: fDelta,
      depositDelta: dDelta,
      note: note || '',
      date: new Date().toISOString()
    };

    await neonQuery(`
      UPDATE users
      SET usdt_balance = GREATEST(0, usdt_balance + ${uDelta}),
          fg_balance = GREATEST(0, fg_balance + ${fDelta}),
          deposit_balance = GREATEST(0, deposit_balance + ${dDelta}),
          last_admin_adjustment = ${sqlEscape(JSON.stringify(adjustment))}::jsonb,
          updated_at = NOW()
      WHERE id = ${sqlEscape(String(userId))}
    `);

    const uRes = await neonQuery(`SELECT * FROM users WHERE id = ${sqlEscape(String(userId))}`);
    const updatedUser = formatUser(uRes.rows?.[0]);

    // Send Telegram Notification
    try {
      const changes = [];
      if (uDelta !== 0) changes.push(`💵 *Earned USDT:* \`${uDelta > 0 ? '+' : ''}${uDelta.toFixed(4)} USDT\``);
      if (fDelta !== 0) changes.push(`🪙 *FN Coins:* \`${fDelta > 0 ? '+' : ''}${fDelta} FN coin\``);
      if (dDelta !== 0) changes.push(`💼 *Deposit / Topup:* \`${dDelta > 0 ? '+' : ''}${dDelta.toFixed(4)} USDT\``);

      if (changes.length > 0) {
        const noteText = note ? `\n📝 *Reason / Note:* _${note}_\n` : '';
        const notifyText = `⚡ *Balance Updated by Administration!*\n\nThe administrator has updated your account balance:\n${changes.join('\n')}\n${noteText}\n📊 *Your New Account Balance:*\n• Earned USDT: \`$${Number(updatedUser?.usdtBalance || 0).toFixed(4)} USDT\`\n• Topup / Deposit: \`$${Number(updatedUser?.depositBalance || 0).toFixed(4)} USDT\`\n• FN Coins: \`${Number(updatedUser?.fgBalance || 0)} FN coin\`\n\n_Tap below to check your wallet in Tiko Grow:_`;

        sendTg('sendMessage', {
          chat_id: userId,
          text: notifyText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl({ id: userId }) } }]]
          }
        }).catch(() => null);
      }
    } catch {}

    return corsResponse({ success: true, user: updatedUser });
  }

  // 1.15 ADMIN TOP USERS
  if (path === '/admin/users/top' && method === 'GET') {
    const type = url.searchParams.get('type') === 'balance' ? 'balance' : 'referrals';
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 30));

    let res;
    if (type === 'balance') {
      res = await neonQuery(`
        SELECT * FROM users
        ORDER BY (usdt_balance + deposit_balance) DESC, usdt_balance DESC
        LIMIT ${limit}
      `);
    } else {
      res = await neonQuery(`
        SELECT * FROM users
        ORDER BY referral_count DESC, referral_usdt_earned DESC, done_tasks_count DESC
        LIMIT ${limit}
      `);
    }

    const users = (res.rows || []).map(r => formatUser(r));
    return corsResponse({ success: true, type, users });
  }

  // 1.16 ADMIN CAMPAIGNS & ADVANCE SUBMISSIONS
  if (path === '/admin/campaigns' && method === 'GET') {
    const res = await neonQuery(`SELECT * FROM tasks WHERE creator_id IS NOT NULL AND creator_id != 'admin' ORDER BY created_at DESC`);
    return corsResponse((res.rows || []).map(r => formatTask(r)));
  }

  if (path === '/admin/advance-tasks/submissions' && method === 'GET') {
    const status = url.searchParams.get('status') || 'pending';
    let res;
    if (status === 'all') {
      res = await neonQuery(`SELECT * FROM advance_task_submissions ORDER BY created_at DESC LIMIT 50`);
    } else {
      res = await neonQuery(`SELECT * FROM advance_task_submissions WHERE status = ${sqlEscape(status)} ORDER BY created_at DESC LIMIT 50`);
    }
    return corsResponse(res.rows || []);
  }

  // 1.17 USER SYNC (MINI APP INIT)
  if (path === '/user/sync' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const uid = String(body.id || body.userId || '');
    if (!uid) return corsResponse({ error: 'Missing user id' }, 400);

    const username = body.username || `user_${uid}`;
    const firstName = body.firstName || body.first_name || 'Member';

    await neonQuery(`
      INSERT INTO users (
        id, username, first_name, photo_url, level, rank_title, member_number,
        referral_code, referral_count, referral_usdt_earned, claimed_milestones,
        usdt_balance, deposit_balance, fg_balance, done_tasks_count,
        last_check_in_date, ad_completions, created_at
      ) VALUES (
        ${sqlEscape(uid)}, ${sqlEscape(username)}, ${sqlEscape(firstName)},
        '/default_user.png', 'LV.1', '', '#802,793',
        ${sqlEscape('ref_' + uid.slice(-6))}, 0, 0, '[]'::jsonb,
        0, 0, 0, 0, NULL, '{}'::jsonb, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        updated_at = NOW()
    `);

    const compRes = await neonQuery(`SELECT task_id FROM task_completions WHERE user_id = ${sqlEscape(uid)}`);
    const completedTasks = (compRes.rows || []).map(r => r.task_id);

    const uRes = await neonQuery(`SELECT * FROM users WHERE id = ${sqlEscape(uid)}`);
    return corsResponse({ user: formatUser(uRes.rows?.[0], completedTasks) });
  }

  // 1.18 TASK COMPLETE (5% USDT COMMISSION ONLY, NO FN COINS)
  if (path === '/tasks/complete' && method === 'POST') {
    const { userId, taskId } = await request.json().catch(() => ({}));
    if (!userId || !taskId) return corsResponse({ error: 'Missing params' }, 400);

    const uid = String(userId);
    const tRes = await neonQuery(`SELECT * FROM tasks WHERE id = ${sqlEscape(taskId)}`);
    const task = tRes.rows?.[0];
    if (!task) return corsResponse({ error: 'Task not found' }, 404);

    const uRes = await neonQuery(`SELECT * FROM users WHERE id = ${sqlEscape(uid)}`);
    const user = uRes.rows?.[0];
    if (!user) return corsResponse({ error: 'User not found' }, 404);

    const usdtReward = Number(parseFloat(task.usdt_reward || 0));
    const fgReward = Number(parseFloat(task.fg_reward || 0));

    // Insert completion
    await neonQuery(`
      INSERT INTO task_completions (user_id, task_id, completed_at)
      VALUES (${sqlEscape(uid)}, ${sqlEscape(taskId)}, NOW())
      ON CONFLICT (user_id, task_id) DO UPDATE SET completed_at = NOW()
    `);

    // Credit user
    await neonQuery(`
      UPDATE users
      SET usdt_balance = usdt_balance + ${usdtReward},
          fg_balance = fg_balance + ${fgReward},
          done_tasks_count = done_tasks_count + 1,
          updated_at = NOW()
      WHERE id = ${sqlEscape(uid)}
    `);

    // 5% Referral Commission (USDT ONLY - NO FN COINS)
    if (user.referred_by && String(user.referred_by) !== uid) {
      const commUsdt = Number((usdtReward * 0.05).toFixed(4));
      if (commUsdt > 0) {
        await neonQuery(`
          UPDATE users
          SET usdt_balance = usdt_balance + ${commUsdt},
              referral_usdt_earned = referral_usdt_earned + ${commUsdt},
              updated_at = NOW()
          WHERE id = ${sqlEscape(user.referred_by)}
        `);

        // Notify Referrer
        sendTg('sendMessage', {
          chat_id: user.referred_by,
          text: `💰 *5% Referral Commission Received!* 🎉\n\nYour invited member completed *${task.title}*.\n• *+${commUsdt} USDT*\n\nYour friend completed a task and 5% commission has been credited to your balance! Keep inviting to earn more!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '💰 Open Tiko Grow & Earn', web_app: { url: buildWebAppUrl({ id: user.referred_by }) } }]]
          }
        }).catch(() => null);
      }
    }

    // Increment task joined
    await neonQuery(`
      UPDATE tasks
      SET joined_members = joined_members + 1,
          status = CASE WHEN participants > 0 AND (joined_members + 1) >= participants THEN 'completed' ELSE status END
      WHERE id = ${sqlEscape(taskId)}
    `);

    const updatedURes = await neonQuery(`SELECT * FROM users WHERE id = ${sqlEscape(uid)}`);
    const compTasks = await neonQuery(`SELECT task_id FROM task_completions WHERE user_id = ${sqlEscape(uid)}`);
    return corsResponse({ success: true, user: formatUser(updatedURes.rows?.[0], (compTasks.rows || []).map(r => r.task_id)) });
  }

  // 1.19 REFERRAL MILESTONES
  if (path === '/referrals/milestones' && method === 'GET') {
    const uid = url.searchParams.get('userId') || 'guest_user';
    const uRes = await neonQuery(`SELECT * FROM users WHERE id = ${sqlEscape(uid)}`);
    const user = uRes.rows?.[0] || {};

    const activeRes = await neonQuery(`
      SELECT COUNT(*)::int as count 
      FROM users 
      WHERE referred_by = ${sqlEscape(uid)} AND done_tasks_count >= 30
    `);
    const activeReferralCount = activeRes.rows?.[0]?.count || 0;

    const mRes = await neonQuery(`SELECT * FROM referral_milestones ORDER BY required ASC`);
    const claimedList = Array.isArray(user.claimed_milestones) ? user.claimed_milestones : [];

    const milestones = (mRes.rows || []).map(m => ({
      id: m.id,
      title: m.title,
      required: Number(m.required),
      usdtReward: Number(parseFloat(m.usdt_reward).toFixed(4)),
      fgReward: Number(parseFloat(m.fg_reward).toFixed(2)),
      claimed: claimedList.includes(m.id),
      canClaim: activeReferralCount >= m.required && !claimedList.includes(m.id),
      currentCount: activeReferralCount
    }));

    return corsResponse({
      milestones,
      referralCount: user.referral_count || 0,
      activeReferralCount,
      referralUsdtEarned: Number(parseFloat(user.referral_usdt_earned || 0).toFixed(4)),
      referralCode: user.referral_code || ('ref_' + String(uid).slice(-6))
    });
  }

  // 1.20 USER WITHDRAWALS
  if (path.startsWith('/wallet/withdrawals/') && method === 'GET') {
    const targetUid = path.replace('/wallet/withdrawals/', '');
    const wRes = await neonQuery(`SELECT * FROM withdrawals WHERE user_id = ${sqlEscape(targetUid)} ORDER BY created_at DESC LIMIT 20`);
    return corsResponse((wRes.rows || []).map(formatWithdrawal));
  }

  // 1.21 USER WITHDRAW CREATE
  if (path === '/wallet/withdraw' && method === 'POST') {
    const { userId, amount, bep20Address } = await request.json().catch(() => ({}));
    if (!userId || !amount || !bep20Address) return corsResponse({ error: 'Missing parameters' }, 400);

    const uid = String(userId);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1.0) return corsResponse({ error: 'Minimum withdrawal is 1.00 USDT' }, 400);

    const uRes = await neonQuery(`SELECT usdt_balance FROM users WHERE id = ${sqlEscape(uid)}`);
    const curBal = parseFloat(uRes.rows?.[0]?.usdt_balance || 0);
    if (curBal < amt) return corsResponse({ error: 'Insufficient balance' }, 400);

    const id = 'w_' + Date.now();
    await neonQuery(`
      UPDATE users SET usdt_balance = usdt_balance - ${amt}, updated_at = NOW() WHERE id = ${sqlEscape(uid)};
      INSERT INTO withdrawals (id, user_id, amount_usdt, network, bep20_address, status, created_at)
      VALUES (${sqlEscape(id)}, ${sqlEscape(uid)}, ${amt}, 'BEP-20 (BNB Smart Chain)', ${sqlEscape(bep20Address)}, 'pending', NOW());
    `);

    const updatedUser = await neonQuery(`SELECT * FROM users WHERE id = ${sqlEscape(uid)}`);
    return corsResponse({ success: true, message: 'Withdrawal submitted', user: formatUser(updatedUser.rows?.[0]) });
  }

  // Fallback for unhandled API paths
  return corsResponse({ error: `Path /api${path} not found` }, 404);
}

// ─────────────────────────────────────────────────────────────
// 2. MAIN FETCH HANDLER (Cloudflare Worker entry)
// ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle OPTIONS CORS preflight
    if (request.method === 'OPTIONS') {
      return corsOptionsResponse();
    }

    // 1. Health check & status
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response('Tiko 24/7 Serverless API & Telegram Bot Engine is running OK!', {
        status: 200,
        headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. Setup Webhook Endpoint
    if (url.pathname === '/setup-webhook') {
      const webhookUrl = `${url.origin}/webhook`;
      const res = await sendTg('setWebhook', {
        url: webhookUrl,
        allowed_updates: ['message', 'channel_post', 'callback_query']
      });
      return corsResponse({ success: true, webhookUrl, telegramResponse: res });
    }

    // 3. Webhook Info Check
    if (url.pathname === '/webhook-info') {
      const info = await sendTg('getWebhookInfo', {});
      return corsResponse(info);
    }

    // 4. Telegram Webhook Receiver (24/7)
    if (url.pathname === '/webhook' || url.pathname.endsWith('/webhook')) {
      if (request.method === 'POST') {
        try {
          const update = await request.json();
          ctx.waitUntil(handleTelegramUpdate(update));
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      return new Response('Webhook endpoint is active.', { status: 200 });
    }

    // 5. SERVERLESS API HANDLER (/api/...)
    if (url.pathname.startsWith('/api')) {
      try {
        return await handleApiRequest(request, url);
      } catch (err) {
        console.error('[API Error]:', err.message);
        return corsResponse({ error: err.message }, 500);
      }
    }

    // 6. Default Proxy Mode: Outbound calls to https://api.telegram.org
    const targetUrl = new URL(url.pathname + url.search, 'https://api.telegram.org');
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('cf-ray');
    headers.delete('cf-connecting-ip');
    headers.delete('x-real-ip');
    headers.delete('x-forwarded-for');
    headers.delete('x-forwarded-proto');

    const init = {
      method: request.method,
      headers: headers,
      redirect: 'follow',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.arrayBuffer();
    }

    try {
      const response = await fetch(targetUrl.toString(), init);
      const resHeaders = new Headers(response.headers);
      resHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

// ─────────────────────────────────────────────────────────────
// 3. TELEGRAM BOT EVENT HANDLER
// ─────────────────────────────────────────────────────────────
async function handleTelegramUpdate(update) {
  if (!update) return;

  const msg = update.message;
  if (!msg || !msg.from) return;

  const from = msg.from;
  const chatId = msg.chat?.id || from.id;
  const text = (msg.text || '').trim();
  const uid = String(from.id);
  const firstName = from.first_name || 'Member';
  const username = from.username || `user_${uid}`;

  // 1. /start command
  if (text.startsWith('/start')) {
    const parts = text.split(/\s+/);
    const refPayload = parts[1] || null;

    try {
      // Upsert user in Neon PostgreSQL
      await neonQuery(`
        INSERT INTO users (
          id, username, first_name, photo_url, level, rank_title, member_number,
          referral_code, referral_count, referral_usdt_earned, claimed_milestones,
          usdt_balance, deposit_balance, fg_balance, done_tasks_count,
          last_check_in_date, ad_completions, created_at
        ) VALUES (
          ${sqlEscape(uid)},
          ${sqlEscape(username)},
          ${sqlEscape(firstName)},
          '/default_user.png',
          'LV.1',
          '',
          '#802,793',
          ${sqlEscape('ref_' + uid.slice(-6))},
          0,
          0,
          '[]'::jsonb,
          0,
          0,
          0,
          0,
          NULL,
          '{}'::jsonb,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          first_name = EXCLUDED.first_name,
          updated_at = NOW()
      `);

      // Track Referral if payload is present
      if (refPayload) {
        try {
          const cleanRef = String(refPayload).trim().replace(/^ref_/, '');
          const checkUser = await neonQuery(`SELECT referred_by FROM users WHERE id = ${sqlEscape(uid)}`);
          const existingRef = checkUser.rows?.[0]?.referred_by;

          if (!existingRef) {
            const refLookup = await neonQuery(`
              SELECT id, username, first_name FROM users
              WHERE (referral_code = ${sqlEscape(refPayload)} 
                 OR referral_code = ${sqlEscape('ref_' + cleanRef)} 
                 OR id = ${sqlEscape(cleanRef)})
                AND id != ${sqlEscape(uid)}
              LIMIT 1
            `);

            const referrer = refLookup.rows?.[0];
            if (referrer && String(referrer.id) !== uid) {
              await neonQuery(`
                UPDATE users
                SET referred_by = ${sqlEscape(referrer.id)}, updated_at = NOW()
                WHERE id = ${sqlEscape(uid)} AND referred_by IS NULL
              `);

              await neonQuery(`
                UPDATE users
                SET referral_count = referral_count + 1, updated_at = NOW()
                WHERE id = ${sqlEscape(referrer.id)}
              `);

              // Notify referrer via Telegram
              await sendTg('sendMessage', {
                chat_id: referrer.id,
                text: `🎉 *New Referral Joined!* 👥\n\n*${firstName}* (@${username}) joined using your invite link!\n\nWhen they complete tasks, you will receive *5% USDT Commission* directly to your account balance!\n\n_Keep sharing your invite link to earn more!_`,
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl({ id: referrer.id }) } }]
                  ]
                }
              }).catch(() => null);
            }
          }
        } catch (refErr) {
          console.error('[Webhook Referral Error]:', refErr.message);
        }
      }
    } catch (dbErr) {
      console.error('[Webhook DB Error]:', dbErr.message);
    }

    const welcomeText = `
👋 *Welcome to Tiko Grow!*

Earn real *USDT & FN coins* by completing quick social tasks, watching video ads, and referring friends.

💰 *Tasks:* Earn USDT & FN coins per task
👥 *Referral Program:* 5% Commission per completed task
⚡ *Instant Crypto Withdrawals:* BEP-20 (BNB Smart Chain)

_Tap the button below to launch the Mini App:_
    `.trim();

    await sendTg('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl(from) } }],
          [
            { text: '📢 Task Updates', url: UPDATE_CHANNEL },
            { text: '💬 Discussion', url: DISCUSSION_GROUP }
          ]
        ]
      }
    });
    return;
  }

  // 2. /balance command
  if (text.startsWith('/balance')) {
    try {
      const uRes = await neonQuery(`SELECT usdt_balance, fg_balance, deposit_balance, done_tasks_count FROM users WHERE id = ${sqlEscape(uid)}`);
      const user = uRes.rows?.[0] || { usdt_balance: 0, fg_balance: 0, deposit_balance: 0, done_tasks_count: 0 };

      const balanceText = `
*Portfolio Summary for ${firstName}:*

• Earned USDT: *${Number(user.usdt_balance || 0).toFixed(4)}* USDT
• FN Coins: *${user.fg_balance || 0}* FN coin
• Topup Balance: *${Number(user.deposit_balance || 0).toFixed(2)}* USDT
• Completed Tasks: *${user.done_tasks_count || 0}*

_Launch the application to execute swaps, task campaigns, or withdrawals._
      `.trim();

      await sendTg('sendMessage', {
        chat_id: chatId,
        text: balanceText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl(from) } }]
          ]
        }
      });
    } catch (err) {
      console.error('[Webhook /balance Error]:', err.message);
    }
    return;
  }

  // 3. /help command
  if (text.startsWith('/help')) {
    const helpText = `
*Tiko Grow Help & Support*

• /start - Launch main interaction interface
• /balance - View token balances and valuation
• /help - Assistance and support links

📢 Updates: ${UPDATE_CHANNEL}
💬 Discussion: ${DISCUSSION_GROUP}
    `.trim();

    await sendTg('sendMessage', {
      chat_id: chatId,
      text: helpText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Open Tiko Grow', web_app: { url: buildWebAppUrl(from) } }],
          [
            { text: '📢 Task Updates', url: UPDATE_CHANNEL },
            { text: '💬 Discussion', url: DISCUSSION_GROUP }
          ]
        ]
      }
    });
    return;
  }
}
