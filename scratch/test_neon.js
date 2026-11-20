function sqlEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const uid = '5977573271';
const q = `SELECT id, username, first_name FROM users WHERE id = ${sqlEscape(uid)}`;

fetch('https://ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech/sql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Neon-Connection-String': 'postgresql://neondb_owner:npg_ult1ocJR5psX@ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require'
  },
  body: JSON.stringify({ query: q })
})
  .then(r => r.json())
  .then(d => console.log('Result rows:', d.rows))
  .catch(console.error);

