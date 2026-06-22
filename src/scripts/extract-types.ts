import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const outputPath = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\4e67812e-d2da-49a5-9f0b-296e6f03fb2e\\.system_generated\\steps\\293\\output.txt';
  const rawContent = fs.readFileSync(outputPath, 'utf8');
  const jsonContent = JSON.parse(rawContent);
  const typesText = jsonContent.types;
  
  const targetPath = path.join(__dirname, '../../src/types/database.ts');
  fs.writeFileSync(targetPath, typesText, 'utf8');
  console.log('Types written successfully to src/types/database.ts');
}

main().catch(console.error);
