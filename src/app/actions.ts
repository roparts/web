
"use server";

import { generatePartDescription } from "@/ai/flows/generate-part-description";
import { refineVoiceSearch } from "@/ai/flows/refine-voice-search";
import { suggestRelatedParts } from "@/ai/flows/suggest-related-parts";
import { suggestSearchTerm } from "@/ai/flows/suggest-search-term";
import type { Part } from "@/lib/types";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageAction(imageDataUri: string): Promise<string> {
    try {
        const result = await cloudinary.uploader.upload(imageDataUri, {
            folder: "roparts-hub", // Optional: organize uploads in a specific folder
            transformation: [{ width: 600, height: 600, crop: "limit" }]
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image.");
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
