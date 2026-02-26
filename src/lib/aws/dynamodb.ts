import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.MY_AWS_REGION || process.env.AWS_REGION || "eu-north-1";
const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
    console.warn("AWS credentials not found in environment variables. DynamoDB client might fail.");
}

const client = new DynamoDBClient({
    region,
    credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
    },
});

export const ddbDocClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

export const TABLES = {
    PARTS: process.env.DYNAMODB_PARTS_TABLE || 'parts',
    BRANDS: process.env.DYNAMODB_BRANDS_TABLE || 'brands',
    CATEGORIES: process.env.DYNAMODB_CATEGORIES_TABLE || 'categories',
    BANNERS: process.env.DYNAMODB_BANNERS_TABLE || 'banners',
};
