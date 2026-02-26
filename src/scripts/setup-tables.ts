
import 'dotenv/config';
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

async function createTable(tableName: string) {
    const command = new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
        ],
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    try {
        const response = await client.send(command);
        console.log(`Table Created: ${tableName}`);
    } catch (err: any) {
        if (err.name === 'ResourceInUseException') {
            console.log(`Table already exists: ${tableName}`);
        } else {
            console.error(`Error creating table ${tableName}:`, err);
        }
    }
}

async function run() {
    const tables = ['brands', 'categories', 'banners'];
    for (const table of tables) {
        await createTable(table);
    }
}

run();
