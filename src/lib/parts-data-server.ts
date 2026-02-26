
"use server";

import { ddbDocClient, TABLES } from './aws/dynamodb';
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { Part, Brand, AdBanner } from './types';

export async function getAllParts(): Promise<Part[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.PARTS,
    });
    const response = await ddbDocClient.send(command);
    return (response.Items as Part[]) || [];
  } catch (error) {
    console.error("Error fetching parts from DynamoDB:", error);
    return [];
  }
}

export async function getPartById(id: string): Promise<Part | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.PARTS,
      Key: { id },
    });
    const response = await ddbDocClient.send(command);
    return (response.Item as Part) || null;
  } catch (error) {
    console.error("Error fetching part by ID from DynamoDB:", error);
    return null;
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.BRANDS,
    });
    const response = await ddbDocClient.send(command);
    const brands = (response.Items as Brand[]) || [];
    return brands.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching brands from DynamoDB:", error);
    return [];
  }
}

export async function getAllBanners(): Promise<AdBanner[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.BANNERS,
    });
    const response = await ddbDocClient.send(command);
    const banners = (response.Items as AdBanner[]) || [];
    return banners
      .filter(b => b.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching banners from DynamoDB:", error);
    return [];
  }
}
