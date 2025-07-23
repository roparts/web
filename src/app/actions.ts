
"use server";

import 'dotenv/config';
import { generatePartDescription } from "@/ai/flows/generate-part-description";
import { refineVoiceSearch } from "@/ai/flows/refine-voice-search";
import { suggestRelatedParts } from "@/ai/flows/suggest-related-parts";
import { suggestSearchTerm } from "@/ai/flows/suggest-search-term";
import type { Part } from "@/lib/types";
import ImageKit from 'imagekit';
import { randomBytes } from 'crypto';

export async function uploadImageAction(imageDataUri: string): Promise<string> {
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    ) {
      console.error("ImageKit credentials are not configured in .env file.");
      throw new Error("ImageKit credentials are not configured. Please check your .env file and follow the CREDENTIALS_SETUP.md guide.");
    }

    // Validate the Data URI format
    if (!imageDataUri || !imageDataUri.startsWith('data:image/') || !imageDataUri.includes(';base64,')) {
        console.error("Invalid image data URI format received.");
        throw new Error("Invalid image data format. The file may be corrupted or in an unsupported format.");
    }


    try {
        const imagekit = new ImageKit({
          publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
          privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
          urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
        });
        
        // Generate a unique filename
        const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
        const fileName = `ro-part-${uniqueSuffix}.webp`;

        const result = await imagekit.upload({
            file: imageDataUri,
            fileName: fileName,
            folder: "roparts-hub",
            transformation: [{
              "height": "600",
              "width": "600",
              "aspectRatio": "1-1",
              "crop": "pad_resize",
              "format": "webp",
              "quality": "80"
            }]
        });
        return result.url;
    } catch (error) {
        console.error("ImageKit upload failed:", error);
        throw new Error("Failed to upload image. Your credentials seem correct, but the server encountered an error during the upload process. The file might be corrupted.");
    }
}

export async function generateDescriptionAction(input: {
  partName: string;
  partCategory: string;
  partFeatures: string;
}) {
  try {
    const result = await generatePartDescription(input);
    return result.description;
  } catch (error) {
    console.error(error);
    return "Error generating description.";
  }
}

export async function getRelatedParts(part: Part, allParts: Part[]) {
  try {
    // Note: The AI flow is designed to work with names. We pass all available part names.
    const allPartNames = allParts.map(p => p.name);
    const result = await suggestRelatedParts({
      partId: part.id,
      partCategory: part.subcategory,
      partDescription: `${part.name}: ${part.description}`,
      allPartNames,
    });
    return result.relatedParts;
  } catch (error) {
    console.error(error);
    return [];
  }
}


export async function getSearchSuggestion(query: string) {
  // This function is deprecated in favor of client-side Fuse.js search.
  if (!query || query.trim().length < 2) {
    return [];
  }
  try {
    // const result = await suggestSearchTerm({ query });
    // return result.suggestions;
    return [];
  } catch (error) {
    console.error("Error getting search suggestion:", error);
    return [];
  }
}

export async function getRefinedVoiceSearch(transcript: string, allParts: Part[]) {
    if (!transcript.trim()) {
        return "";
    }
    try {
        const result = await refineVoiceSearch({ transcript, allParts });
        return result.refinedQuery;
    } catch (error) {
        console.error("Error refining voice search:", error);
        // Fallback to the original transcript on error
        return transcript;
    }
}
