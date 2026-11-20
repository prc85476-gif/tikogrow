import pg from 'pg';
import { CONFIG } from '../backend/src/config.js';

async function main() {
  const pool = new pg.Pool({
    connectionString: CONFIG.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const res = await pool.query('SELECT id, title, category, type, participants, joined_members, status FROM tasks ORDER BY id');
  console.log('Tasks in DB count:', res.rows.length);
  console.table(res.rows);

  const compRes = await pool.query('SELECT task_id, count(*) FROM task_completions GROUP BY task_id');
  console.log('Task completions count:');
  console.table(compRes.rows);

  await pool.end();
}

main().catch(console.error);
