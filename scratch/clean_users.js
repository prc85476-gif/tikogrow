import { pool } from '../backend/src/db.js';

async function run() {
  const delRes = await pool.query("DELETE FROM users WHERE id = 'undefined' OR id = 'null'");
  console.log('Deleted invalid users:', delRes.rowCount);
  const count = await pool.query("SELECT COUNT(*)::int as count FROM users WHERE id NOT IN ('guest_user', 'undefined', 'null')");
  console.log('Real registered users count:', count.rows[0].count);
  process.exit(0);
}

run();
