// To run this script, use: npm run db:seed
import 'dotenv/config';
import { adminDb } from '../lib/firebase/admin';
import { partsData } from '../lib/parts-data-seed';
import type { Part } from '../lib/types';

const PARTS_COLLECTION = 'parts';

async function seedDatabase() {
  if (!adminDb) {
    console.error(
      'Firebase Admin DB not initialized. Make sure your FIREBASE_SERVICE_ACCOUNT_BASE64 is set in .env'
    );
    return;
  }

  console.log('Starting to seed database...');

  const partsCollection = adminDb.collection(PARTS_COLLECTION);
  const existingPartsSnapshot = await partsCollection.limit(1).get();

  if (!existingPartsSnapshot.empty) {
    console.log(
      'The "parts" collection is not empty. Aborting seed to prevent duplicate data.'
    );
    console.log(
      'If you want to re-seed, please delete the collection from your Firebase console first.'
    );
    return;
  }

  const batch = adminDb.batch();
  let count = 0;

  for (const part of partsData) {
    // Firestore generates the ID, so we don't include our own `id` field in the document.
    const { id, ...partData } = part;
    const docRef = partsCollection.doc(id); // Use the existing ID
    batch.set(docRef, partData);
    count++;
    console.log(`Preparing to add: ${part.name} (${part.id})`);
  }

  try {
    await batch.commit();
    console.log(
      `\n✅ Successfully seeded database with ${count} parts.`
    );
  } catch (error) {
    console.error('🔥 Error committing batch:', error);
  }
}

seedDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
