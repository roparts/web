
"use server";

import ImageKit from "imagekit";
import { generatePartDescription } from '@/ai/flows/generate-part-description';
import { suggestRelatedParts } from '@/ai/flows/suggest-related-parts';
import { refineVoiceSearch } from '@/ai/flows/refine-voice-search';
import { generatePartImage } from '@/ai/flows/generate-part-image';
import type { Part } from '@/lib/types';
import 'dotenv/config';

export async function getRefinedVoiceSearch(transcript: string, allParts: Part[]): Promise<string> {
    const result = await refineVoiceSearch({ transcript, allParts });
    return result.refinedQuery;
}

export async function getRelatedParts(part: Part, allParts: Part[]): Promise<string[]> {
    const allPartNames = allParts.filter(p => p.id !== part.id).map(p => p.name);
    const result = await suggestRelatedParts({
        partId: part.id,
        partCategory: part.subcategory,
        partDescription: part.description,
        allPartNames
    });
    return result.relatedParts;
}

export async function generateDescriptionAction(input: { partName: string, partCategory: string, partFeatures: string }): Promise<string> {
    const result = await generatePartDescription(input);
    return result.description;
}

export async function generateImageAction(input: { partName: string, partCategory: string }): Promise<{ url: string, fileId: string }> {
    const { imageDataUri } = await generatePartImage(input);
    if (!imageDataUri) {
        throw new Error("AI image generation failed.");
    }
    return await uploadImageAction(imageDataUri);
}

export async function uploadImageAction(imageDataUri: string): Promise<{ url: string; fileId: string }> {
    // Basic validation for data URI
    if (!imageDataUri.startsWith('data:image/') || !imageDataUri.includes(';base64,')) {
        throw new Error("Invalid image data URI format. Please upload a valid image file.");
    }
    
    try {
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
            urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        });
        
        const uniqueFileName = `ro-part-${Date.now()}-${Math.round(Math.random() * 1E6)}`;

        const response = await imagekit.upload({
            file: imageDataUri,
            fileName: uniqueFileName,
            folder: "/ro-parts/",
            useUniqueFileName: false,
        });
        
        // Return both url and fileId
        return { url: response.url, fileId: response.fileId };

    } catch (error: any) {
        console.error("ImageKit upload failed with specific error:", error.message);
        // Throw the actual error from the SDK for better debugging.
        throw new Error(`ImageKit Upload Error: ${error.message}`);
    }
}

export async function deleteImageAction(fileId: string): Promise<void> {
    if (!fileId) {
        console.log("No fileId provided for deletion.");
        return;
    }
    try {
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
            urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        });

        await imagekit.deleteFile(fileId);
    } catch (error: any) {
        // Log the error but don't throw, as the main operation (saving the part) might still be valid.
        console.error(`Failed to delete old image (fileId: ${fileId}) from ImageKit:`, error.message);
    }
}
