# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Seeding the Database

This project uses Firestore to store product data. The initial data is in `src/lib/parts-data-seed.ts`. To populate your Firestore database, you need to run the seed script.

**Prerequisites:**
1.  Ensure you have completed the setup in `CREDENTIALS_SETUP.md` and that your `.env` file contains your Firebase Admin SDK credentials.
2.  Install dependencies by running `npm install` in your terminal if you haven't already.

**Run the Seeding Command:**
Open your terminal and run the following command:

```bash
npm run db:seed
```

This will upload all the initial product data to your 'parts' collection in Firestore. You only need to do this once.
