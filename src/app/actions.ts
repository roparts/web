"use server";

import { generatePartDescription } from "@/ai/flows/generate-part-description";
import { suggestRelatedParts } from "@/ai/flows/suggest-related-parts";
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
      partDescription: `${part.name}: ${part.description}`,
    });
    return result.relatedParts;
  } catch (error) {
    console.error(error);
    return [];
  }
}
