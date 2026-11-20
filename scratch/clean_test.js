import { pool } from '../backend/src/db.js';

async function clean() {
  await pool.query("DELETE FROM tasks WHERE title LIKE 'Sequential Number Verification%'");
  const res = await pool.query('SELECT COUNT(*)::int as total FROM tasks');
  await pool.query("SELECT setval('task_number_seq', $1)", [res.rows[0].total]);
  console.log(`Cleaned up. Total tasks now: ${res.rows[0].total}. Sequence set to: ${res.rows[0].total}. Next task will be #${res.rows[0].total + 1}`);
  process.exit(0);
}

clean();

