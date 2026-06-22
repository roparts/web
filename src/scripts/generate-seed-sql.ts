import { partsData } from '../lib/parts-data-seed';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  let sql = '-- Seed data for brands\n';
  
  // Extract unique brands
  const uniqueBrands = Array.from(new Set(partsData.map(p => p.brand).filter(Boolean)));
  const brandMap = new Map<string, string>();
  
  uniqueBrands.forEach((brandName, index) => {
    const brandId = `brand-uuid-${index + 1}`;
    brandMap.set(brandName!, brandId);
    sql += `INSERT INTO brands ("id", "name") VALUES ('${brandId}', '${brandName!.replace(/'/g, "''")}') ON CONFLICT ("id") DO NOTHING;\n`;
  });
  
  sql += '\n-- Seed data for parts\n';
  
  for (const part of partsData) {
    const brandId = part.brand ? brandMap.get(part.brand) : null;
    const brandIdStr = brandId ? `'${brandId}'` : 'NULL';
    
    const fields = [
      `"id"`, `"name"`, `"name_hi"`, `"mainCategory"`, `"subcategory"`,
      `"price"`, `"discountPrice"`, `"description"`, `"description_hi"`,
      `"image"`, `"features"`, `"features_hi"`, `"minQuantity"`,
      `"brand"`, `"brandId"`, `"gpd"`, `"voltage"`,
      `"inletOutletSize"`, `"material"`, `"color"`
    ].join(', ');
    
    const values = [
      `'${part.id}'`,
      `'${part.name.replace(/'/g, "''")}'`,
      part.name_hi ? `'${part.name_hi.replace(/'/g, "''")}'` : 'NULL',
      `'${part.mainCategory.replace(/'/g, "''")}'`,
      `'${part.subcategory.replace(/'/g, "''")}'`,
      part.price,
      part.discountPrice !== undefined ? part.discountPrice : 'NULL',
      `'${part.description.replace(/'/g, "''")}'`,
      part.description_hi ? `'${part.description_hi.replace(/'/g, "''")}'` : 'NULL',
      `'${part.image.replace(/'/g, "''")}'`,
      `'${part.features.replace(/'/g, "''")}'`,
      part.features_hi ? `'${part.features_hi.replace(/'/g, "''")}'` : 'NULL',
      part.minQuantity !== undefined ? part.minQuantity : 1,
      part.brand ? `'${part.brand.replace(/'/g, "''")}'` : 'NULL',
      brandIdStr,
      part.gpd !== undefined ? part.gpd : 'NULL',
      part.voltage ? `'${part.voltage.replace(/'/g, "''")}'` : 'NULL',
      part.inletOutletSize ? `'${part.inletOutletSize.replace(/'/g, "''")}'` : 'NULL',
      part.material ? `'${part.material.replace(/'/g, "''")}'` : 'NULL',
      part.color ? `'${part.color.replace(/'/g, "''")}'` : 'NULL'
    ].join(', ');
    
    sql += `INSERT INTO parts (${fields}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;\n`;
  }
  
  fs.writeFileSync(path.join(__dirname, '../../seed_data.sql'), sql);
  console.log('SQL seed file generated successfully at seed_data.sql');
}

main().catch(console.error);
