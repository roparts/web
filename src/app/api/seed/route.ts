
import { NextResponse } from 'next/server';
import 'dotenv/config';
import { adminDb } from '@/lib/firebase/admin';
import { partsData } from '@/lib/parts-data-seed';

const PARTS_COLLECTION = 'parts';

export async function GET() {
  if (!adminDb) {
    return NextResponse.json(
      { error: 'Firebase Admin DB not initialized.' },
      { status: 500 }
    );
  }

  try {
    const partsCollection = adminDb.collection(PARTS_COLLECTION);
    
    // Safety Check: See if data exists
    const existingPartsSnapshot = await partsCollection.limit(1).get();
    if (!existingPartsSnapshot.empty) {
      return NextResponse.json(
        {
          message: 'Database already seeded. Aborting to prevent duplicates.',
        },
        { status: 200 }
      );
    }
    
    // "Wake up" Firestore with a dummy write/delete. This is a workaround for
    // a common issue when batch writing to a completely empty Firestore database.
    const dummyDoc = partsCollection.doc('__dummy__');
    await dummyDoc.set({ a: 1 });
    await dummyDoc.delete();

    // Now, perform the actual batch write
    const batch = adminDb.batch();
    let count = 0;

    for (const part of partsData) {
      const { id, ...partData } = part;
      const docRef = partsCollection.doc(id);
      batch.set(docRef, partData);
      count++;
    }

    await batch.commit();

    return NextResponse.json(
      { message: `Successfully seeded database with ${count} parts.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to seed database.', details: errorMessage },
      { status: 500 }
    );
  }
}
