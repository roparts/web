# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Seeding the Database

This project uses Firestore to store product data. The initial data is in `src/lib/parts-data-seed.ts`. To populate your Firestore database, you need to trigger the seed process.

**Prerequisites:**
1.  Ensure you have completed the setup in `CREDENTIALS_SETUP.md` and that your `.env` file contains your Firebase Admin SDK credentials.
2.  Install dependencies by running `npm install` in your terminal if you haven't already.

**Run the Seeding Endpoint:**
Once your application is running, open a new browser tab and navigate to the following URL:

`/api/seed`

This will run a one-time script to upload all the initial product data to your 'parts' collection in Firestore. You only need to do this once. The endpoint has a safety check to prevent re-seeding if data already exists.
