import { pool } from '../backend/src/db.js';

async function renumber() {
  console.log('[Renumbering Tasks]');

  // 1. Create sequences
  await pool.query('CREATE SEQUENCE IF NOT EXISTS task_number_seq');
  await pool.query('CREATE SEQUENCE IF NOT EXISTS advance_task_number_seq');

  // 2. Fetch all tasks ordered by created_at ASC
  const res = await pool.query('SELECT id, code, title, created_at FROM tasks ORDER BY created_at ASC');
  console.log(`Renumbering ${res.rows.length} standard/campaign tasks...`);

  for (let i = 0; i < res.rows.length; i++) {
    const task = res.rows[i];
    const newCode = `#${i + 1}`;
    await pool.query('UPDATE tasks SET code = $1 WHERE id = $2', [newCode, task.id]);
    console.log(`Task ${i + 1}/${res.rows.length}: ${task.title} (ID: ${task.id}) -> ${newCode}`);
  }

  // Set sequence to res.rows.length so next is res.rows.length + 1
  await pool.query(`SELECT setval('task_number_seq', $1)`, [Math.max(1, res.rows.length)]);
  console.log(`task_number_seq set to ${res.rows.length}. Next task will be #${res.rows.length + 1}`);

  // 3. Fetch all advance tasks ordered by created_at ASC
  const advRes = await pool.query('SELECT id, code, title, created_at FROM advance_tasks ORDER BY created_at ASC');
  console.log(`\nRenumbering ${advRes.rows.length} advance tasks...`);

  for (let i = 0; i < advRes.rows.length; i++) {
    const task = advRes.rows[i];
    const newCode = `#ADV-${i + 1}`;
    await pool.query('UPDATE advance_tasks SET code = $1 WHERE id = $2', [newCode, task.id]);
    console.log(`Advance Task ${i + 1}/${advRes.rows.length}: ${task.title} (ID: ${task.id}) -> ${newCode}`);
  }

  await pool.query(`SELECT setval('advance_task_number_seq', $1)`, [Math.max(1, advRes.rows.length)]);
  console.log(`advance_task_number_seq set to ${advRes.rows.length}. Next advance task will be #ADV-${advRes.rows.length + 1}`);

  process.exit(0);
}

renumber().catch(err => {
  console.error(err);
  process.exit(1);
});

