import { pool } from '../backend/src/db.js';

async function check() {
  const res = await pool.query('SELECT id, code, title, created_at FROM tasks ORDER BY created_at ASC');
  console.log('Total tasks in tasks table:', res.rows.length);
  res.rows.forEach((r, i) => {
    console.log(`[${i + 1}] ID: ${r.id} | Code: ${r.code} | Title: ${r.title}`);
  });

  const advRes = await pool.query('SELECT id, code, title, created_at FROM advance_tasks ORDER BY created_at ASC');
  console.log('\nTotal advance tasks:', advRes.rows.length);
  advRes.rows.forEach((r, i) => {
    console.log(`[${i + 1}] ID: ${r.id} | Code: ${r.code} | Title: ${r.title}`);
  });

  process.exit(0);
}

check();

