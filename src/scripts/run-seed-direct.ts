import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function run() {
  console.log('Executing database seed...');
  const { GET } = await import('../app/api/seed/route');
  const res = await GET();
  const data = await res.json();
  console.log('Seed response:', JSON.stringify(data, null, 2));
}

run().catch(console.error);
