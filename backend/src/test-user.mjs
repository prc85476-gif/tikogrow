const dbUrl = 'postgresql://neondb_owner:npg_ult1ocJR5psX@ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function resetTask() {
  const res = await fetch('https://ep-jolly-star-bdzeidm5.c-8.us-east-2.aws.neon.tech/sql', {
    method: 'POST',
    headers: { 'Neon-Connection-String': dbUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: "DELETE FROM task_completions WHERE user_id = '5977573271' AND task_id = 'task_official_channel' RETURNING *" })
  });
  const data = await res.json();
  console.log('Reset complete:', data.rows);
}

resetTask();
