
import 'dotenv/config';
import { adminDb } from '../lib/firebase/admin';
import { ddbDocClient, TABLES } from '../lib/aws/dynamodb';
import { PutCommand } from "@aws-sdk/lib-dynamodb";

async function migrateCollection(collectionName: string, tableName: string) {
    if (!adminDb) {
        console.error("Firebase Admin DB not initialized.");
        return;
    }

    console.log(`Migrating ${collectionName} to ${tableName}...`);
    const snapshot = await adminDb.collection(collectionName).get();

    if (snapshot.empty) {
        console.log(`No documents found in ${collectionName}.`);
        return;
    }

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const item = { ...data, id: doc.id };

        try {
            await ddbDocClient.send(new PutCommand({
                TableName: tableName,
                Item: item,
            }));
            console.log(`  Migrated ${collectionName} ID: ${doc.id}`);
        } catch (err) {
            console.error(`  Failed to migrate ${collectionName} ID: ${doc.id}`, err);
        }
    }
}

async function runMigration() {
    try {
        await migrateCollection('parts', TABLES.PARTS);
        await migrateCollection('brands', TABLES.BRANDS);
        await migrateCollection('categories', TABLES.CATEGORIES);
        await migrateCollection('banners', TABLES.BANNERS);
        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    }
}

runMigration();
