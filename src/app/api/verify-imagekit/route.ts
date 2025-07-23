
import { NextResponse } from 'next/server';
import 'dotenv/config';
import ImageKit from 'imagekit';

export async function GET() {
  const { 
    IMAGEKIT_PUBLIC_KEY, 
    IMAGEKIT_PRIVATE_KEY, 
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT 
  } = process.env;

  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    return NextResponse.json(
      { 
        success: false,
        message: 'ImageKit credentials are not configured in your .env file.',
        error: 'Missing one or more required environment variables: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT. Please check CREDENTIALS_SETUP.md.',
      },
      { status: 500 }
    );
  }

  try {
    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    // Perform a simple, lightweight operation to verify credentials and connection
    await imagekit.listFiles({
      limit: 1, // We only need to list one file to know it works
      path: "/", // Check the root folder
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'ImageKit connection successful! Credentials are correct and the service is reachable.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('ImageKit verification failed:', error);
    const errorMessage = error.message || 'An unknown error occurred.';
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to connect to ImageKit. Please verify your credentials in the .env file.',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
