
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
    
    // Use a loop to write each document individually for robustness.
    let count = 0;
    for (const part of partsData) {
      const { id, ...partData } = part;
      const docRef = partsCollection.doc(id);
      await docRef.set(partData);
      count++;
    }

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
