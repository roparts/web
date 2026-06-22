import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const seedPath = path.join(__dirname, '../../seed_data.sql');
  const content = fs.readFileSync(seedPath, 'utf8');
  const lines = content.split('\n');
  
  // First part: Brands and first set of parts (lines 1-50)
  const part1 = lines.slice(0, 50).join('\n');
  // Second part: Next set of parts (lines 50-100)
  const part2 = lines.slice(50, 100).join('\n');
  // Third part: Final set of parts (lines 100-153)
  const part3 = lines.slice(100).join('\n');
  
  fs.writeFileSync(path.join(__dirname, '../../seed_1.sql'), part1);
  fs.writeFileSync(path.join(__dirname, '../../seed_2.sql'), part2);
  fs.writeFileSync(path.join(__dirname, '../../seed_3.sql'), part3);
  
  console.log('Seed files split successfully: seed_1.sql, seed_2.sql, seed_3.sql generated.');
}

main().catch(console.error);
