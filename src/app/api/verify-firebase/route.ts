
import { NextResponse } from 'next/server';
import 'dotenv/config';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  const { FIREBASE_SERVICE_ACCOUNT_BASE64 } = process.env;

  if (!FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Firebase credentials are not configured in your .env file.',
        error: 'Missing required environment variable: FIREBASE_SERVICE_ACCOUNT_BASE64. Please check CREDENTIALS_SETUP.md and ensure the variable is present.',
      },
      { status: 500 }
    );
  }

  if (!adminDb) {
     return NextResponse.json(
      { 
        success: false,
        message: 'Firebase Admin SDK failed to initialize.',
        error: 'The adminDb object is null. This usually means there was an error parsing the service account credentials or connecting to Firebase. Check your server logs for a more specific initialization error.',
      },
      { status: 500 }
    );
  }

  try {
    // Perform a simple, lightweight operation to verify the connection and permissions.
    // Listing collections is a good way to confirm authentication.
    await adminDb.listCollections();

    return NextResponse.json(
      { 
        success: true,
        message: 'Firebase Admin connection successful! Credentials are correct and the service is reachable.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Firebase Admin verification failed:', error);
    const errorMessage = error.message || 'An unknown error occurred.';
    
    let userFriendlyError = `The connection attempt failed with the following error: "${errorMessage}".`;
    if (error.code === 'permission-denied' || error.code === 7) {
        userFriendlyError += ' This often indicates an incorrect Project ID or that the service account does not have sufficient permissions. Please double-check your credentials and IAM settings in the Google Cloud Console.';
    } else if (errorMessage.includes('json')) {
        userFriendlyError += ' This suggests the Base64-encoded service account key might be corrupted or incorrectly formatted. Please try re-generating and re-encoding it following the steps in CREDENTIALS_SETUP.md.';
    }

    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to connect to Firebase Admin. Please verify your credentials in the .env file.',
        error: userFriendlyError
      },
      { status: 500 }
    );
  }
}
