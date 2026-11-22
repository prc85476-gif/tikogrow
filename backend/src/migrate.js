import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: CONFIG.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('[Neon] Setting up database tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) DEFAULT 'Member',
        first_name VARCHAR(255) DEFAULT 'Member',
        photo_url TEXT DEFAULT '/default_user.png',
        level VARCHAR(50) DEFAULT 'LV.1',
        rank_title VARCHAR(100) DEFAULT '',
        member_number VARCHAR(50) DEFAULT '#802,793',
        referral_code VARCHAR(100),
        referred_by VARCHAR(255),
        referral_count INT DEFAULT 0,
        referral_usdt_earned NUMERIC(14, 4) DEFAULT 0.0000,
        claimed_milestones JSONB DEFAULT '[]'::jsonb,
        usdt_balance NUMERIC(14, 4) DEFAULT 0.0000,
        deposit_balance NUMERIC(14, 4) DEFAULT 0.0000,
        fg_balance NUMERIC(14, 2) DEFAULT 0.00,
        done_tasks_count INT DEFAULT 0,
        last_check_in_date VARCHAR(20),
        ad_completions JSONB DEFAULT '{}'::jsonb,
        last_admin_adjustment JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS all_ads_completed_at BIGINT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS claimed_channel_bonus BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS total_bets_count INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS total_bet_amount NUMERIC(14, 2) DEFAULT 0.00;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS total_won_amount NUMERIC(14, 2) DEFAULT 0.00;
      CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT 'auto';

      CREATE TABLE IF NOT EXISTS aviator_bets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        amount NUMERIC(14, 2) NOT NULL,
        deducted_from_deposit NUMERIC(14, 2) DEFAULT 0.00,
        deducted_from_withdraw NUMERIC(14, 2) DEFAULT 0.00,
        cashed_out_multiplier NUMERIC(10, 2),
        payout NUMERIC(14, 2) DEFAULT 0.00,
        added_to_withdraw NUMERIC(14, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_aviator_bets_user_id ON aviator_bets(user_id);

      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id VARCHAR(255) NOT NULL,
        referred_id VARCHAR(255) NOT NULL,
        referred_username VARCHAR(255),
        reward_amount NUMERIC(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        creator_id VARCHAR(255),
        title TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        has_globe BOOLEAN DEFAULT FALSE,
        usdt_reward NUMERIC(10, 4) DEFAULT 0.0050,
        fg_reward NUMERIC(10, 2) DEFAULT 5.00,
        total_cost_usdt NUMERIC(12, 4) DEFAULT 0.0000,
        participants INT DEFAULT 100,
        joined_members INT DEFAULT 0,
        joined_user_ids JSONB DEFAULT '[]'::jsonb,
        code VARCHAR(50),
        category VARCHAR(50) DEFAULT 'telegram',
        type VARCHAR(50) DEFAULT 'telegram',
        link TEXT,
        description TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        reject_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_completions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id VARCHAR(255) NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_user_task UNIQUE (user_id, task_id)
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        amount_usdt NUMERIC(12, 4) NOT NULL,
        network VARCHAR(100) DEFAULT 'BEP-20 (BNB Smart Chain)',
        bep20_address VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        tx_hash TEXT,
        reject_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS referral_milestones (
        id VARCHAR(100) PRIMARY KEY,
        required INT NOT NULL,
        usdt_reward NUMERIC(10, 4) NOT NULL,
        fg_reward NUMERIC(10, 2) NOT NULL,
        title VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS broadcasts (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        url TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chat_mappings (
        channel_key VARCHAR(255) PRIMARY KEY,
        chat_id VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS deposits (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        network VARCHAR(50) NOT NULL,
        deposit_address VARCHAR(255) NOT NULL,
        amount_usdt NUMERIC(14, 4) DEFAULT 0,
        request_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'waiting',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS advance_tasks (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        instructions TEXT,
        link TEXT,
        usdt_reward NUMERIC(10, 4) DEFAULT 0.5000,
        fg_reward NUMERIC(10, 2) DEFAULT 50.00,
        participants INT DEFAULT 100,
        completed_count INT DEFAULT 0,
        code VARCHAR(50),
        category VARCHAR(50) DEFAULT 'advance',
        is_verified BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS advance_task_submissions (
        id VARCHAR(255) PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        screenshot_filename TEXT,
        screenshot_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        reject_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reviewed_at TIMESTAMP WITH TIME ZONE
      );

      CREATE SEQUENCE IF NOT EXISTS task_number_seq;
      CREATE SEQUENCE IF NOT EXISTS advance_task_number_seq;
    `);

    // Ensure initial core channel mappings exist
    const defaultMappings = [
      { key: 'task_official_channel', chatId: '-1004473781169' },
      { key: 'pazklkgnb2zmndk0', chatId: '-1004473781169' },
      { key: '+pazklkgnb2zmndk0', chatId: '-1004473781169' },
      { key: 'airdropidentifyofficial', chatId: '-1004473781169' },
      { key: 'the_royal_crypto', chatId: '-1004456854181' },
      { key: 'trxpowerminingofficial', chatId: '-1004399339132' },
      { key: 'trx_world_work', chatId: '-1003714360768' },
      { key: 'picassopayout', chatId: '-1003949815083' },
      { key: 'task_official_group', chatId: '-1003949815083' },
      { key: 'task_official_channel_2', chatId: '-1004456854181' },
      { key: 'task_official_channel_3', chatId: '-1004399339132' },
      { key: 'sh7xgcyobeuyzme1', chatId: '-1004456854181' },
      { key: 'h0ugewkc7mg1ngfl', chatId: '-1004399339132' }
    ];

    for (const m of defaultMappings) {
      await client.query(`
        INSERT INTO chat_mappings (channel_key, chat_id)
        VALUES ($1, $2)
        ON CONFLICT (channel_key) DO UPDATE SET chat_id = EXCLUDED.chat_id
      `, [m.key.toLowerCase(), m.chatId]);
    }

    console.log('[Neon] Tables verified.');

    // Ensure default tasks have required limits: Telegram/Twitter (1000) and Ads (5000)
    await client.query(`
      UPDATE tasks 
      SET participants = 1000 
      WHERE (category = 'telegram' OR category = 'twitter') 
        AND id IN ('task_official_channel', 'task_official_channel_2', 'task_official_channel_3', 'task_official_group', 'task_official_twitter', 'task_tw_1', 'task_tw_2', 'task_tw_4')
        AND participants != 1000;

      UPDATE tasks 
      SET participants = 5000 
      WHERE (category = 'ads' OR type = 'ad' OR id LIKE 'task_ad_%')
        AND participants != 5000;
    `);

    // Seed referral milestones if empty
    const { rows: milestoneRows } = await client.query('SELECT COUNT(*) as count FROM referral_milestones');
    if (parseInt(milestoneRows[0].count) === 0) {
      console.log('[Neon] Seeding referral milestones...');
      const milestones = [
        { id: 'ref_10', required: 10, usdtReward: 0.02, fgReward: 0, title: '10 Active Referrals' },
        { id: 'ref_50', required: 50, usdtReward: 1.00, fgReward: 0, title: '50 Active Referrals' },
        { id: 'ref_100', required: 100, usdtReward: 5.00, fgReward: 0, title: '100 Active Referrals' }
      ];
      for (const m of milestones) {
        await client.query(`
          INSERT INTO referral_milestones (id, required, usdt_reward, fg_reward, title)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [m.id, m.required, m.usdtReward, m.fgReward, m.title]);
      }
    }

    // Migrate from data.json if exists and users table is empty
    const { rows: userCountRows } = await client.query('SELECT COUNT(*) as count FROM users');
    const dbFile = path.join(__dirname, '..', 'data.json');

    if (parseInt(userCountRows[0].count) === 0 && fs.existsSync(dbFile)) {
      console.log('[Neon] Migrating local data.json into Neon Postgres...');
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

      // 1. Users
      if (data.users) {
        for (const u of Object.values(data.users)) {
          await client.query(`
            INSERT INTO users (
              id, username, first_name, photo_url, level, rank_title, member_number,
              referral_code, referral_count, referral_usdt_earned, claimed_milestones,
              usdt_balance, deposit_balance, fg_balance, done_tasks_count,
              last_check_in_date, ad_completions, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            ON CONFLICT (id) DO NOTHING
          `, [
            u.id, u.username || 'Member', u.firstName || 'Member', u.photoUrl || '/default_user.png',
            u.level || 'LV.1', u.rankTitle || '', u.memberNumber || '#802,793',
            u.referralCode || ('ref_' + u.id), u.referralCount || 0, u.referralUsdtEarned || 0,
            JSON.stringify(u.claimedMilestones || []), u.usdtBalance || 0, u.depositBalance || 0,
            u.fgBalance || 0, u.doneTasksCount || 0, u.lastCheckInDate || null,
            JSON.stringify(u.adCompletions || {}), u.createdAt || new Date().toISOString()
          ]);

          if (Array.isArray(u.tasksCompleted)) {
            for (const tId of u.tasksCompleted) {
              await client.query(`
                INSERT INTO task_completions (user_id, task_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, task_id) DO NOTHING
              `, [u.id, tId]).catch(() => null);
            }
          }
        }
        console.log(`[Neon] Migrated ${Object.keys(data.users).length} users.`);
      }

      // 2. Tasks
      if (Array.isArray(data.tasks)) {
        for (const t of data.tasks) {
          await client.query(`
            INSERT INTO tasks (
              id, creator_id, title, is_verified, has_globe, usdt_reward, fg_reward,
              total_cost_usdt, participants, joined_members, joined_user_ids,
              code, category, type, link, description, status, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            ON CONFLICT (id) DO NOTHING
          `, [
            t.id, t.creatorId || null, t.title, Boolean(t.isVerified), Boolean(t.hasGlobe),
            t.usdtReward || 0.005, t.fgReward || 5, t.totalCostUsdt || 0,
            t.participants || 100, t.joinedMembers || 0, JSON.stringify(t.joinedUserIds || []),
            t.code || '', t.category || 'telegram', t.type || 'telegram', t.link || '',
            t.description || '', t.status || 'approved', t.createdAt || new Date().toISOString()
          ]);
        }
        console.log(`[Neon] Migrated ${data.tasks.length} tasks.`);
      }

      // 3. Withdrawals
      if (Array.isArray(data.withdrawals)) {
        for (const w of data.withdrawals) {
          await client.query(`
            INSERT INTO withdrawals (
              id, user_id, amount_usdt, network, bep20_address, status, tx_hash, reject_reason, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            ON CONFLICT (id) DO NOTHING
          `, [
            w.id, w.userId, w.amountUsdt, w.network || 'BEP-20 (BNB Smart Chain)',
            w.bep20Address, w.status || 'pending', w.txHash || '', w.rejectReason || '',
            w.createdAt || new Date().toISOString()
          ]);
        }
      }

      // 4. Chat Mappings
      if (data.chatMappings) {
        for (const [key, val] of Object.entries(data.chatMappings)) {
          await client.query(`
            INSERT INTO chat_mappings (channel_key, chat_id)
            VALUES ($1, $2)
            ON CONFLICT (channel_key) DO UPDATE SET chat_id = EXCLUDED.chat_id
          `, [key, val]);
        }
      }
    }

    console.log('[Neon] Ready & fully synchronized.');
  } finally {
    client.release();
  }
}

// If run directly: node src/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[Neon Migration Error]:', err);
      process.exit(1);
    });
}

