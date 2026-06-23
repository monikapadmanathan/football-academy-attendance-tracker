require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL;
console.log('DATABASE_URL loaded:', Boolean(url));
console.log('URL preview:', url && url.slice(0, 80));

for (const label of ['no args', 'with url env']) {
  try {
    const client = label === 'no args' ? new PrismaClient() : new PrismaClient({
      log: ['query']
    });
    console.log(label + ': constructed successfully');
    client.$disconnect().catch(() => {});
  } catch (err) {
    console.error(label + ': constructor failed');
    console.error(err && err.stack ? err.stack : err);
  }
}
