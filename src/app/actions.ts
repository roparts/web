
"use server";

import { generatePartDescription } from "@/ai/flows/generate-part-description";
import { refineVoiceSearch } from "@/ai/flows/refine-voice-search";
import { suggestRelatedParts } from "@/ai/flows/suggest-related-parts";
import { suggestSearchTerm } from "@/ai/flows/suggest-search-term";
import type { Part } from "@/lib/types";

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

export async function getRelatedParts(part: Part) {
  try {
    const result = await suggestRelatedParts({
      partId: part.id,
      partCategory: part.subcategory,
      partDescription: `${part.name}: ${part.description}`,
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

export async function getRefinedVoiceSearch(transcript: string) {
    if (!transcript.trim()) {
        return "";
    }
    try {
        const result = await refineVoiceSearch({ transcript });
        return result.refinedQuery;
    } catch (error) {
        console.error("Error refining voice search:", error);
        // Fallback to the original transcript on error
        return transcript;
    }
}

    