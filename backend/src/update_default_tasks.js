import pg from 'pg';
import { CONFIG } from './config.js';

async function main() {
  const pool = new pg.Pool({
    connectionString: CONFIG.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('[Task Sync] Updating default tasks in Neon Postgres...');

  // 1. Update Telegram default tasks: participants = 1000, joined_members = 0, status = 'approved'
  const tgRes = await pool.query(`
    UPDATE tasks 
    SET participants = 1000, 
        joined_members = 0, 
        joined_user_ids = '[]'::jsonb, 
        status = 'approved'
    WHERE id IN (
      'task_official_channel', 
      'task_official_channel_2', 
      'task_official_channel_3', 
      'task_official_group'
    )
    RETURNING id, title, participants, joined_members, status;
  `);
  console.log('Updated Telegram tasks:');
  console.table(tgRes.rows);

  // 2. Update Twitter default tasks: participants = 1000, joined_members = 0, status = 'approved'
  const twRes = await pool.query(`
    UPDATE tasks 
    SET participants = 1000, 
        joined_members = 0, 
        joined_user_ids = '[]'::jsonb, 
        status = 'approved'
    WHERE id IN (
      'task_official_twitter', 
      'task_tw_1', 
      'task_tw_2', 
      'task_tw_4'
    )
    RETURNING id, title, participants, joined_members, status;
  `);
  console.log('Updated Twitter tasks:');
  console.table(twRes.rows);

  // 3. Update Ads default tasks: participants = 5000, joined_members = 0, status = 'approved'
  const adsRes = await pool.query(`
    UPDATE tasks 
    SET participants = 5000, 
        joined_members = 0, 
        joined_user_ids = '[]'::jsonb, 
        status = 'approved'
    WHERE id LIKE 'task_ad_%' OR category = 'ads' OR type = 'ad'
    RETURNING id, title, participants, joined_members, status;
  `);
  console.log('Updated Ads tasks:');
  console.table(adsRes.rows);

  // 4. Reset task completions for these default tasks so users start with 0 and can complete again
  const delComps = await pool.query(`
    DELETE FROM task_completions 
    WHERE task_id IN (
      'task_official_channel', 'task_official_channel_2', 'task_official_channel_3', 'task_official_group',
      'task_official_twitter', 'task_tw_1', 'task_tw_2', 'task_tw_4'
    ) OR task_id LIKE 'task_ad_%';
  `);
  console.log(`Cleared ${delComps.rowCount} old task completions.`);

  // 5. Reset ad_completions on users table so daily ads can be clicked and tested from 0
  await pool.query(`
    UPDATE users 
    SET ad_completions = '{}'::jsonb, 
        all_ads_completed_at = NULL;
  `);
  console.log('Cleared user ad completions.');

  await pool.end();
  console.log('[Task Sync] Completed successfully.');
}

main().catch(console.error);
