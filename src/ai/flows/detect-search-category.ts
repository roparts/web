
'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting a product category from a search query.
 *
 * - detectSearchCategory - A function that takes a search query and determines if it maps to a known product category.
 * - DetectSearchCategoryInput - The input schema for the flow.
 * - DetectSearchCategoryOutput - The output schema for the flow.
 */
import {z} from 'zod';
import {ai} from '../genkit';
import {partsData} from '@/lib/parts-data';

const DetectSearchCategoryInputSchema = z.object({
  query: z.string(),
});
type DetectSearchCategoryInput = z.infer<
  typeof DetectSearchCategoryInputSchema
>;

const uniqueCategories = [
  ...new Set(partsData.map(p => p.subcategory)),
];

const DetectSearchCategoryOutputSchema = z.object({
  category: z
    .string()
    .nullable()
    .describe(
      `The detected category from the list [${uniqueCategories.join(
        ', '
      )}]. If no specific category is detected, this should be null.`
    ),
});
type DetectSearchCategoryOutput = z.infer<
  typeof DetectSearchCategoryOutputSchema
>;

const detectSearchCategoryFlow = ai.defineFlow(
  {
    name: 'detectSearchCategoryFlow',
    inputSchema: DetectSearchCategoryInputSchema,
    outputSchema: DetectSearchCategoryOutputSchema,
  },
  async ({query}) => {
    if (!query) {
      return {category: null};
    }

    const llmResponse = await ai.generate({
      prompt: `You are an e-commerce search assistant for a Reverse Osmosis (RO) parts store.
        Your task is to determine if a user's search query strongly implies ONE specific product subcategory from the provided list.

        RULES:
        1. Analyze the user's query for strong subcategory indicators.
        2. If the query (including common misspellings or transliterations) clearly refers to one of the available subcategories, return that subcategory name.
        3. If the query is for a specific product name (e.g., a model number), a brand, or is ambiguous, you MUST return null.
        4. Your response MUST be one of the exact strings from the "AVAILABLE SUBCATEGORIES" list, or the literal value null. Do not provide any other text.

        AVAILABLE SUBCATEGORIES:
        [${uniqueCategories.join(', ')}]

        EXAMPLES:
        - User Query: "membranes" -> Category: "RO Membranes"
        - User Query: "filtr" -> Category: "Pre-Filters / Sediment"
        - User Query: "मेम्ब्रेन" -> Category: "RO Membranes"
        - User Query: "पंप" -> Category: "Pump (Booster Pump)"
        - User Query: "aqua pure" -> Category: null
        - User Query: "solenoid" -> Category: "Solenoid Valve"
        - User Query: "valves" -> Category: "Solenoid Valve"
        - User Query: "housing for membrane" -> Category: "Membrane Housing"
        - User Query: "ROP-0001" -> Category: null

        User Query: "${query}"
      `,
      config: {
        temperature: 0,
      },
    });

    const category = llmResponse.text.trim();
    
    if (category.toLowerCase() === 'null') {
      return { category: null };
    }

    if (uniqueCategories.includes(category)) {
      return {category};
    }

    return {category: null};
  }
);

export async function detectSearchCategory(
  input: DetectSearchCategoryInput
): Promise<DetectSearchCategoryOutput> {
  // This flow is currently not used in the application but is kept for potential future use.
  // It has been superceded by a more robust client-side search (Fuse.js).
  // return await detectSearchCategoryFlow(input);
  return { category: null };
}

    
