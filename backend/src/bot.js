import { Telegraf, Markup } from 'telegraf';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BANNER_IMAGE_PATH = path.join(__dirname, 'assets', 'tiko_banner.jpg');

let botInstance = null;

export function getWebAppUrlForUser(userOrChatId, userMeta = {}) {
  const base = CONFIG.WEBAPP_URL || 'https://qz4gige81pt4u0yx81c5obvc.179.197.255.88.sslip.io';
  if (!userOrChatId) return base;
  const id = typeof userOrChatId === 'object' ? userOrChatId.id : userOrChatId;
  const name = typeof userOrChatId === 'object' ? (userOrChatId.first_name || '') : (userMeta.firstName || userMeta.first_name || '');
  const username = typeof userOrChatId === 'object' ? (userOrChatId.username || '') : (userMeta.username || '');
  const sep = base.includes('?') ? '&' : '?';
  let url = `${base}${sep}tg_id=${id}`;
  if (name) url += `&tg_name=${encodeURIComponent(name)}`;
  if (username) url += `&tg_user=${encodeURIComponent(username)}`;
  return url;
}

export function initBot() {
  if (!CONFIG.BOT_TOKEN) {
    console.warn('[Notice] BOT_TOKEN not found in backend/.env. Running API without active Telegram bot polling.');
    return null;
  }

  try {
    const bot = new Telegraf(CONFIG.BOT_TOKEN, {
      telegram: {
        apiRoot: CONFIG.TELEGRAM_API_ROOT || 'https://api.telegram.org'
      }
    });

    // Track live active users on any bot interaction
    bot.use((ctx, next) => {
      if (ctx.from?.id) {
        db.trackUserActive(ctx.from.id);
      }
      return next();
    });

    // /start command
    bot.start(async (ctx) => {
      try {
        const tgUser = ctx.from;
        await db.updateUser(tgUser.id, {
          username: tgUser.username || `user_${tgUser.id}`,
          firstName: tgUser.first_name || 'Member'
        });

        // Track referral code if passed via /start <payload>
        const refPayload = ctx.payload || (ctx.message?.text ? ctx.message.text.split(' ')[1] : null);
        if (refPayload) {
          try {
            const trackRes = await db.trackReferral(tgUser.id, refPayload);
            if (trackRes.tracked && trackRes.referrerId) {
              notifyReferralJoined(trackRes.referrerId, {
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username
              }).catch(() => null);
            }
          } catch (refErr) {
            console.warn('[Bot Referral Track Warn]:', refErr.message);
          }
        }

        const welcomeText = `
👋 *Welcome to Tiko Grow!*

Earn real USDT & FN coins by completing quick social tasks, watching video ads, and referring friends.

💰 *Tasks:* Earn USDT & FN coins per task
👥 *Referral Program:* 5% Commission per completed task
⚡ *Instant Crypto Withdrawals:* BEP-20 (BNB Smart Chain)

_Tap the button below to launch the Mini App:_
`.trim();

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(ctx.from))],
          [
            Markup.button.url('📢 Task Updates', 'https://t.me/AirdropIdentifyOfficial'),
            Markup.button.url('💬 Discussion', CONFIG.PROMOTER_CHANNEL || 'https://t.me/picassopayout')
          ]
        ]);

        return await ctx.replyWithMarkdown(welcomeText, keyboard);
      } catch (err) {
        console.error('[Bot /start Error]:', err.message);
      }
    });

    bot.command('balance', async (ctx) => {
      try {
        const user = await db.getUser(ctx.from.id);
        return ctx.replyWithMarkdown(
          `*Portfolio Summary for ${ctx.from.first_name}:*\n\n` +
          `• Earned USDT: *${Number(user.usdtBalance || 0).toFixed(4)}* USDT\n` +
          `• FN Coins: *${user.fgBalance || 0}* ${CONFIG.COIN_NAME}\n` +
          `• Topup Balance: *${Number(user.depositBalance || 0).toFixed(2)}* USDT\n` +
          `• Completed Tasks: *${user.doneTasksCount || 0}*\n\n` +
          `_Launch the application to execute swaps, task campaigns, or withdrawals._`,
          Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(ctx.from))]
          ])
        );
      } catch (err) {
        console.error('[Bot /balance Error]:', err.message);
      }
    });

    bot.command('refer', async (ctx) => {
      try {
        const user = await db.getUser(ctx.from.id);
        const refCode = user.referralCode || `ref_${ctx.from.id}`;
        const botUser = ctx.botInfo?.username || 'TikoGrowbot';
        const refLink = `https://t.me/${botUser}?start=${refCode}`;
        return ctx.replyWithMarkdown(
          `👥 *Tiko Grow Referral Program*\n\n` +
          `Invite friends and earn *5% lifetime USDT commission* whenever they complete tasks!\n\n` +
          `🔗 *Your Referral Link:*\n\`${refLink}\`\n\n` +
          `• Total Referrals: *${user.referralCount || 0}*\n` +
          `• Active Referrals (≥50 tasks): *${user.activeReferralCount || 0}*\n` +
          `• Commission Earned: *${Number(user.referralUsdtEarned || 0).toFixed(4)} USDT*\n\n` +
          `_Open the Mini App to check your referral milestone progress!_`,
          Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(ctx.from))]
          ])
        );
      } catch (err) {
        console.error('[Bot /refer Error]:', err.message);
      }
    });

    bot.command('help', (ctx) => {
      return ctx.replyWithMarkdown(
        `*Tiko Grow Help & Support*\n\n` +
        `• /start - Launch main interaction interface\n` +
        `• /balance - View token balances and valuation\n` +
        `• /help - Assistance and support links\n\n` +
        `📢 Updates: ${CONFIG.OFFICIAL_CHANNEL || 'https://t.me/AirdropIdentifyOfficial'}\n` +
        `💬 Discussion: https://t.me/picassopayout`
      );
    });

    // 1. Channel post event (bot is admin and post is published in channel)
    bot.on('channel_post', async (ctx) => {
      try {
        const chat = ctx.channelPost?.chat || ctx.chat;
        if (!chat) return;
        const chatIdStr = String(chat.id);
        const title = chat.title || 'Channel';
        console.log(`[Bot Event] Channel post detected in "${title}" (${chatIdStr})`);

        await db.setChatMapping(chatIdStr, chatIdStr);
        if (chat.username) {
          await db.setChatMapping(chat.username.toLowerCase().replace(/^@/, ''), chatIdStr);
        }
        if (chat.title) {
          await db.setChatMapping(chat.title.toLowerCase().trim(), chatIdStr);
        }
        console.log(`[Bot Event] Successfully auto-mapped channel "${title}" (${chatIdStr}).`);
      } catch (err) {
        console.error('[Bot channel_post Error]:', err.message);
      }
    });

    // 2. Track when bot is added as Admin in any channel or group
    bot.on('my_chat_member', async (ctx) => {
      try {
        const chat = ctx.chat;
        const status = ctx.myChatMember?.new_chat_member?.status;
        const chatIdStr = String(chat.id);
        const title = chat.title || 'Channel';
        console.log(`[Bot Event] Admin status updated in chat "${title}" (${chatIdStr}): ${status}`);

        await db.setChatMapping(chatIdStr, chatIdStr);
        if (chat.username) {
          await db.setChatMapping(chat.username.toLowerCase().replace(/^@/, ''), chatIdStr);
        }
        if (chat.title) {
          await db.setChatMapping(chat.title.toLowerCase().trim(), chatIdStr);
        }
        console.log(`[Bot Event] Channel "${title}" (${chatIdStr}) mapped with status: ${status}`);
      } catch (err) {
        console.error('[Bot my_chat_member Error]:', err.message);
      }
    });

    // 3. User forwards a post from their channel to the bot, or runs /setchannel
    bot.on('message', async (ctx, next) => {
      try {
        const msg = ctx.message;
        // Check if message is forwarded from a channel
        const fwdChat = msg.forward_from_chat || msg.forward_origin?.chat;
        if (fwdChat && (fwdChat.type === 'channel' || fwdChat.type === 'supergroup')) {
          const chatIdStr = String(fwdChat.id);
          const title = fwdChat.title || 'Channel';
          console.log(`[Bot Event] Received forwarded channel post from "${title}" (${chatIdStr})`);

          await db.setChatMapping(chatIdStr, chatIdStr);
          if (fwdChat.username) {
            await db.setChatMapping(fwdChat.username.toLowerCase().replace(/^@/, ''), chatIdStr);
          }
          if (fwdChat.title) {
            await db.setChatMapping(fwdChat.title.toLowerCase().trim(), chatIdStr);
          }

          return ctx.replyWithMarkdown(
            `✅ *Channel Successfully Connected!* 🎉\n\n` +
            `• *Title:* ${title}\n` +
            `• *Chat ID:* \`${chatIdStr}\`\n\n` +
            `_This channel has been linked to task verification. getChatMember is active!_`
          );
        }

        // Manual command /setchannel <id>
        if (msg.text && msg.text.startsWith('/setchannel')) {
          const parts = msg.text.trim().split(/\s+/);
          const channelId = parts[1];
          if (channelId) {
            const chatIdStr = String(channelId);
            await db.setChatMapping('task_official_channel', chatIdStr);
            await db.setChatMapping('pazklkgnb2zmndk0', chatIdStr);
            await db.setChatMapping('+pazklkgnb2zmndk0', chatIdStr);
            await db.setChatMapping(chatIdStr, chatIdStr);
            return ctx.replyWithMarkdown(
              `✅ *Channel Linked!* \n\nID \`${chatIdStr}\` is now linked to \`task_official_channel\` and \`+paZKlKGNB2ZmNDk0\`!`
            );
          } else {
            return ctx.replyWithMarkdown(
              `ℹ️ *Channel Link Usage:*\n\n` +
              `• Simply *forward any post* from your channel to this bot.\n` +
              `• OR type: \`/setchannel -100xxxxxxxxx\``
            );
          }
        }
      } catch (err) {
        console.error('[Bot Message Handler Error]:', err.message);
      }
      return next();
    });

    bot.catch((err) => {
      console.warn('[Bot Warning]', err.message || err);
    });

    botInstance = bot;
    bot.launch({ dropPendingUpdates: true }).then(() => {
      console.log(`[Bot] @${CONFIG.BOT_USERNAME} Long-polling active! Listening for /start and commands.`);
    }).catch((err) => {
      console.warn('[Bot Launch Error]:', err.message);
    });
    console.log(`[Bot] @${CONFIG.BOT_USERNAME} Telegram engine ready.`);
    return bot;
  } catch (error) {
    console.error('[Bot Error]', error);
    return null;
  }
}

export async function sendTelegramMessage(chatId, text, extra = {}) {
  if (!CONFIG.BOT_TOKEN || !chatId) return false;

  // 1. Try via active Telegraf bot instance
  try {
    if (botInstance) {
      await botInstance.telegram.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        ...extra
      });
      return true;
    }
  } catch (err) {
    const errMsg = err?.message || '';
    if (errMsg.includes('blocked') || errMsg.includes('deactivated') || errMsg.includes('chat not found') || errMsg.includes('user not found')) {
      // User blocked the bot or account deactivated - do not retry
      return false;
    }
    console.warn(`[Bot Instance Message Warn (${chatId})]:`, errMsg);
    // If Markdown parsing error, retry plain text immediately
    try {
      if (botInstance) {
        await botInstance.telegram.sendMessage(chatId, text.replace(/[*_`\[\]]/g, ''), extra);
        return true;
      }
    } catch (innerErr) {
      if (innerErr?.message?.includes('blocked') || innerErr?.message?.includes('deactivated')) {
        return false;
      }
    }
  }

  // 2. Reliable Fallback via direct Telegram HTTP Bot API
  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...(extra.reply_markup ? { reply_markup: extra.reply_markup } : {})
    };
    const root = CONFIG.TELEGRAM_API_ROOT || 'https://api.telegram.org';
    let res = await fetch(`${root}/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const desc = errJson?.description || '';
      if (desc.includes('blocked') || desc.includes('deactivated') || desc.includes('chat not found')) {
        return false;
      }
      // Retry without markdown parsing
      delete payload.parse_mode;
      payload.text = text.replace(/[*_`\[\]]/g, '');
      res = await fetch(`${root}/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    return res.ok;
  } catch (directErr) {
    console.warn(`[Bot Direct API Warn (${chatId})]:`, directErr.message);
    return false;
  }
}

// 0. Referral Joined notification to referrer (5% USDT commission notice)
export async function notifyReferralJoined(referrerId, joinedUser) {
  if (!referrerId) return false;

  const firstName = joinedUser?.firstName || joinedUser?.first_name || '';
  const lastName = joinedUser?.lastName || joinedUser?.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Member';
  const rawUsername = joinedUser?.username ? String(joinedUser.username).replace(/^@/, '') : '';

  const safeName = String(fullName).replace(/[*_`\[\]]/g, '');
  const userTag = rawUsername ? `(@${rawUsername.replace(/[*_`\[\]]/g, '')})` : '';

  const text = `
🎉 *New Referral Joined!* 👥

👁️🐾 *${safeName}* ${userTag} joined using your invite link!

When they complete tasks, you will receive *5% USDT Commission* directly to your account balance!

_Keep sharing your invite link to earn more!_
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(referrerId))]
  ]);

  return sendTelegramMessage(referrerId, text, keyboard);
}

// 1. Broadcast New Task to all users
export async function broadcastNewTaskMessage(task) {
  if (!CONFIG.BOT_TOKEN) return false;

  const typeLabel =
    task.category === 'ads'
      ? 'Sponsor Video Ad'
      : task.category === 'twitter'
      ? 'Twitter (X) Task'
      : 'Drip Task (every 1-3 min)';

  const safeTitle = String(task.title || 'New Task').replace(/[*_`\[\]]/g, '');
  const safeCode = String(task.code || '').replace(/[*_`\[\]]/g, '');
  const usdtReward = Number(task.usdtReward !== undefined ? task.usdtReward : (task.usdt_reward !== undefined ? task.usdt_reward : 0.015));
  const fgReward = Number(task.fgReward !== undefined ? task.fgReward : (task.fg_reward !== undefined ? task.fg_reward : 15));
  const slots = task.participants || task.slots || 100;

  const text = `
🆕 *New Task Available on Tiko Grow!*

📋 *Task:* ${safeTitle} ${safeCode}
📌 *Type:* ${typeLabel}
👥 *Slots:* ${slots}
💰 *Reward:* +${usdtReward} USDT & +${fgReward} ${CONFIG.COIN_NAME}

_Complete the task now to earn rewards!_
  `.trim();

  try {
    const adminId = '5977573271'; // Owner/Admin Telegram ID
    const creatorId = task.creatorId && /^\d+$/.test(String(task.creatorId)) ? String(task.creatorId) : null;
    const priorityIds = Array.from(new Set([adminId, creatorId].filter(Boolean)));

    // 1. Send IMMEDIATELY to Admin and Task Creator (Instant Zero-Delay Notification!)
    for (const pId of priorityIds) {
      try {
        const priorityKeyboard = Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(pId))],
          [
            Markup.button.url('📢 Task Updates', 'https://t.me/AirdropIdentifyOfficial'),
            Markup.button.url('💬 Discussion', 'https://t.me/picassopayout')
          ]
        ]);
        const ok = await sendTelegramMessage(pId, text, priorityKeyboard);
        console.log(`[Bot Priority Delivery] Task "${safeTitle}" -> User ${pId}: ${ok ? 'OK' : 'FAILED'}`);
      } catch (pErr) {
        console.warn(`[Bot Priority Delivery Error (${pId})]:`, pErr.message);
      }
    }

    // 2. Fetch users and broadcast in fast parallel batches to all other members
    const users = await db.getAllUsers();
    console.log(`[Bot Broadcast] Broadcasting task "${safeTitle}" to ${users.length} members...`);
    const otherUsers = users.filter((u) => u.id && /^\d+$/.test(String(u.id)) && !priorityIds.includes(String(u.id)));

    const BATCH_SIZE = 15;
    for (let i = 0; i < otherUsers.length; i += BATCH_SIZE) {
      const batch = otherUsers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (u) => {
        try {
          const userKeyboard = Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(u.id, u))],
            [
              Markup.button.url('📢 Task Updates', 'https://t.me/AirdropIdentifyOfficial'),
              Markup.button.url('💬 Discussion', 'https://t.me/picassopayout')
            ]
          ]);
          await sendTelegramMessage(u.id, text, userKeyboard);
        } catch {}
      }));
      if (i + BATCH_SIZE < otherUsers.length) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    console.log(`[Bot Broadcast] Successfully finished broadcasting task "${safeTitle}".`);
  } catch (err) {
    console.warn('[Broadcast Error]:', err.message);
  }
  return true;
}

// 2. Task completed notification to user
export async function notifyTaskCompleted(userId, task, earnedUsdt, earnedFg, updatedUser) {
  if (!userId) return false;
  const text = `
✅ *Task Completed Successfully!*

📋 *Task:* ${task.title} ${task.code || ''}
💰 *Reward Added:* +${earnedUsdt} USDT & +${earnedFg} ${CONFIG.COIN_NAME}
💳 *New Earned Balance:* ${Number(updatedUser?.usdtBalance || 0).toFixed(4)} USDT

_Keep completing tasks on Tiko Grow to earn more!_
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId, updatedUser))]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}

// 3. Campaign approval notification to creator
export async function notifyCampaignApproved(creatorId, campaign) {
  if (!creatorId) return false;
  const text = `
🎉 *Your Campaign has been APPROVED!*

📋 *Campaign:* ${campaign.title}
👥 *Target Slots:* ${campaign.participants || 100} members
💰 *Participant Reward:* $${campaign.usdtReward || 0.015} USDT

_Your campaign is now live to all members in Tiko Grow!_
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 View My Campaign', getWebAppUrlForUser(creatorId))]
  ]);

  return sendTelegramMessage(creatorId, text, keyboard);
}

// 4. Campaign submitted confirmation to creator
export async function notifyCampaignSubmitted(creatorId, campaign) {
  if (!creatorId) return false;
  const text = `
📝 *Campaign Submitted Successfully!*

📋 *Campaign:* ${campaign.title}
⏳ *Status:* Pending Admin Review
💰 *Budget Reserved:* $${campaign.totalCostUsdt || 0} USDT

_Our admin team will review and approve your campaign shortly._
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(creatorId))]
  ]);

  return sendTelegramMessage(creatorId, text, keyboard);
}

// 5. Withdrawal Approved & Paid notification to user with Action Buttons
export async function notifyWithdrawalApproved(withdrawal) {
  if (!withdrawal || !withdrawal.userId) return false;
  const userId = withdrawal.userId;
  const amount = Number(withdrawal.amountUsdt || 0).toFixed(2);
  const addr = withdrawal.bep20Address || '';
  const txHash = withdrawal.txHash || '';

  const text = `
🎉 *Withdrawal Sent to Your Wallet!* 💸

Your withdrawal request has been verified and processed by admin.

💰 *Amount Sent:* *${amount} USDT*
🌐 *Network:* BNB Smart Chain (BEP-20)
📍 *Wallet:* \`${addr}\`
${txHash ? `🔗 *Transaction Hash:* \`${txHash}\`\n` : ''}
✅ *Status:* Completed & Transferred

_Thank you for completing tasks on Tiko Grow! Keep earning more rewards._
  `.trim();

  const buttons = [
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId, withdrawal))]
  ];

  if (txHash && txHash.startsWith('0x')) {
    buttons.push([
      Markup.button.url('🔍 View on BscScan', `https://bscscan.com/tx/${txHash}`)
    ]);
  }

  buttons.push([
    Markup.button.url('📢 Payment Proofs & Community', 'https://t.me/picassopayout')
  ]);

  const keyboard = Markup.inlineKeyboard(buttons);

  return sendTelegramMessage(userId, text, keyboard);
}

// 6. Withdrawal Rejected notification to user
export async function notifyWithdrawalRejected(withdrawal, reason) {
  if (!withdrawal || !withdrawal.userId) return false;
  const userId = withdrawal.userId;
  const amount = Number(withdrawal.amountUsdt || 0).toFixed(2);

  const text = `
⚠️ *Withdrawal Request Notice*

Your withdrawal order of *${amount} USDT* could not be processed.

❗ *Reason:* ${reason || 'Compliance check or invalid address'}
🔄 *Refund:* The full amount has been refunded back to your Earned USDT Balance.

_You can check your wallet details and submit a new request anytime in Tiko Grow._
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId, withdrawal))],
    [Markup.button.url('💬 Support Community', 'https://t.me/picassopayout')]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}

// 7. Broadcast New Advance Task to all users
export async function broadcastAdvanceTaskMessage(task) {
  if (!CONFIG.BOT_TOKEN) return false;

  const usdtReward = Number(task.usdtReward || task.usdt_reward || 0.5).toFixed(2);
  const fgReward = Number(task.fgReward || task.fg_reward || 50);

  const safeTitle = String(task.title || 'Advance Task').replace(/([*_\[\]])/g, '');
  const safeCode = task.code ? String(task.code).replace(/([*_\[\]])/g, '') : '';

  const text = `
⚡ *New High-Reward Advance Task Available!*

📋 *Task:* ${safeTitle} ${safeCode}
💰 *Reward:* +$${usdtReward} USDT & +${fgReward} ${CONFIG.COIN_NAME}
👥 *Slots:* ${task.participants || 100} members
📝 *Type:* Complete & Submit Screenshot Proof

_Open Tiko Grow now, read the instructions, and submit your proof to claim rewards!_
  `.trim();

  try {
    const adminId = '5977573271';
    const creatorId = task.creatorId && /^\d+$/.test(String(task.creatorId)) ? String(task.creatorId) : null;
    const priorityIds = Array.from(new Set([adminId, creatorId].filter(Boolean)));

    // 1. Send IMMEDIATELY to Admin and Task Creator (Instant Zero-Delay)
    for (const pId of priorityIds) {
      try {
        const priorityKeyboard = Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Tiko Grow & Complete Task', getWebAppUrlForUser(pId))],
          [
            Markup.button.url('📢 Task Updates', 'https://t.me/AirdropIdentifyOfficial'),
            Markup.button.url('💬 Discussion', 'https://t.me/picassopayout')
          ]
        ]);
        const ok = await sendTelegramMessage(pId, text, priorityKeyboard);
        console.log(`[Bot Priority Delivery] Advance "${safeTitle}" -> User ${pId}: ${ok ? 'OK' : 'FAILED'}`);
      } catch (pErr) {
        console.warn(`[Bot Priority Delivery Error (${pId})]:`, pErr.message);
      }
    }

    // 2. Fetch users and broadcast in fast parallel batches to all other members
    const users = await db.getAllUsers();
    console.log(`[Bot Broadcast] Broadcasting advance task "${safeTitle}" to ${users.length} members...`);
    const otherUsers = users.filter((u) => u.id && /^\d+$/.test(String(u.id)) && !priorityIds.includes(String(u.id)));

    const BATCH_SIZE = 15;
    for (let i = 0; i < otherUsers.length; i += BATCH_SIZE) {
      const batch = otherUsers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (u) => {
        try {
          const userKeyboard = Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Tiko Grow & Complete Task', getWebAppUrlForUser(u.id, u))],
            [
              Markup.button.url('📢 Task Updates', 'https://t.me/AirdropIdentifyOfficial'),
              Markup.button.url('💬 Discussion', 'https://t.me/picassopayout')
            ]
          ]);
          await sendTelegramMessage(u.id, text, userKeyboard);
        } catch {}
      }));
      if (i + BATCH_SIZE < otherUsers.length) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    console.log(`[Bot Broadcast] Sent advance task to ${otherUsers.length} telegram users.`);
  } catch (err) {
    console.warn('[Broadcast Advance Task Error]:', err.message);
  }
  return true;
}

// 8. Advance Task Approved notification to user
export async function notifyAdvanceTaskApproved(userId, task, usdtEarned, fgEarned, updatedUser) {
  if (!userId) return false;
  const text = `
🎉 *Advance Task Approved & Paid!* 💰

📋 *Task:* ${task.title}
💵 *Reward Added:* +$${Number(usdtEarned || 0).toFixed(4)} USDT & +${fgEarned || 0} ${CONFIG.COIN_NAME}
💳 *New Earned Balance:* ${Number(updatedUser?.usdtBalance || 0).toFixed(4)} USDT

_Your screenshot proof was verified by the admin team. Keep completing tasks to earn more!_
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId, updatedUser))]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}

// 9. Advance Task Rejected notification to user
export async function notifyAdvanceTaskRejected(userId, task, reason) {
  if (!userId) return false;
  const text = `
⚠️ *Advance Task Submission Declined*

📋 *Task:* ${task.title}
❗ *Reason:* ${reason || 'Proof screenshot did not match the task instructions'}

_You can review the task details and submit a new screenshot proof inside Tiko Grow._
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId))]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}

// 10. Campaign Removed / Refunded notification to creator
export async function notifyCampaignRemovedRefund(userId, campaign, refundAmount) {
  if (!userId) return false;
  const text = `
ℹ️ *Campaign Notice: Removed & Refunded*

📋 *Campaign:* ${campaign.title}
🔄 *Refund Credited:* +$${Number(refundAmount || 0).toFixed(4)} USDT
💼 *Destination:* Your Topup Balance

_The campaign has been cancelled. Any unused budget has been safely credited back to your Topup Balance for creating future campaigns._
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId))]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}

// 11. Deposit Confirmed notification to user
export async function notifyDepositConfirmed(userId, amount) {
  if (!userId) return false;
  const text = `
✅ *Deposit Successful!* 💰

+$*${Number(amount || 0).toFixed(2)}* USDT has been credited to your *Topup Balance*!
You can now create new task campaigns or promote your channels!

_Tap below to manage your campaigns:_
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId))]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}

// 12. Admin Balance Adjustment notification to user
export async function notifyAdminBalanceAdjustment(userId, usdtDelta, fgDelta, depositDelta, note, newBalance) {
  if (!userId) return false;

  const changes = [];
  if (usdtDelta && Number(usdtDelta) !== 0) {
    const sign = Number(usdtDelta) > 0 ? '+' : '';
    changes.push(`💵 *Earned USDT:* \`${sign}${Number(usdtDelta).toFixed(4)} USDT\``);
  }
  if (fgDelta && Number(fgDelta) !== 0) {
    const sign = Number(fgDelta) > 0 ? '+' : '';
    changes.push(`🪙 *${CONFIG.COIN_NAME} Coins:* \`${sign}${Number(fgDelta)} ${CONFIG.COIN_NAME}\``);
  }
  if (depositDelta && Number(depositDelta) !== 0) {
    const sign = Number(depositDelta) > 0 ? '+' : '';
    changes.push(`💼 *Deposit / Topup:* \`${sign}${Number(depositDelta).toFixed(4)} USDT\``);
  }

  if (changes.length === 0) return false;

  const noteText = note ? `\n📝 *Reason / Note:* _${note}_\n` : '';

  const text = `
⚡ *Balance Updated by Administration!*

The administrator has updated your account balance:
${changes.join('\n')}
${noteText}
📊 *Your New Account Balance:*
• Earned USDT: \`$${Number(newBalance?.usdtBalance || 0).toFixed(4)} USDT\`
• Topup / Deposit: \`$${Number(newBalance?.depositBalance || 0).toFixed(4)} USDT\`
• ${CONFIG.COIN_NAME} Coins: \`${Number(newBalance?.fgBalance || 0)} ${CONFIG.COIN_NAME}\`

_Tap below to check your wallet in Tiko Grow:_
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 Open Tiko Grow', getWebAppUrlForUser(userId))]
  ]);

  return sendTelegramMessage(userId, text, keyboard);
}
