'use server';
/**
 * @fileOverview A Genkit flow that provides intelligent search suggestions.
 *
 * - suggestSearchTerm - A function that suggests search terms based on a user's query.
 * - SuggestSearchTermInput - The input type for the suggestSearchTerm function.
 * - SuggestSearchTermOutput - The return type for the suggestSearchTerm function.
 */

import {ai} from '@/ai/genkit';
import {partsData} from '@/lib/parts-data';
import {z} from 'zod';

const SuggestSearchTermInputSchema = z.object({
  query: z.string(),
});
export type SuggestSearchTermInput = z.infer<typeof SuggestSearchTermInputSchema>;

const SuggestSearchTermOutputSchema = z.object({
  suggestions: z.array(z.string()),
});
export type SuggestSearchTermOutput = z.infer<
  typeof SuggestSearchTermOutputSchema
>;

const allPartNamesAndCategories = [
  ...new Set([
    ...partsData.map(p => p.name),
    ...partsData.map(p => p.category),
    ...partsData.map(p => p.name_hi || '').filter(Boolean),
    ...partsData.map(p => p.category_hi || '').filter(Boolean),
  ]),
].join(', ');

const suggestSearchTermFlow = ai.defineFlow(
  {
    name: 'suggestSearchTermFlow',
    inputSchema: SuggestSearchTermInputSchema,
    outputSchema: SuggestSearchTermOutputSchema,
  },
  async ({query}) => {
    if (!query) {
      return {suggestions: []};
    }
    const llmResponse = await ai.generate({
      prompt: `You are a helpful search assistant for an e-commerce store that sells Reverse Osmosis (RO) parts.
        Your task is to provide relevant search suggestions based on the user's query.

        STRICT RULES:
        1. Your suggestions MUST be relevant to products from the "AVAILABLE PARTS & CATEGORIES" list.
        2. Correct common spelling mistakes.
        3. Handle Hindi transliteration variations (e.g., "मेंबराने" -> "मेम्ब्रेन").
        4. Provide up to 4 suggestions, ranked by relevance.
        5. You MUST return ONLY a valid JSON array of strings. Do not include any other text, explanations, or markdown.
        6. Do not include the original query in the suggestions unless it's a valid term itself.
        7. If you have no good suggestions, you MUST return an empty JSON array: [].

        AVAILABLE PARTS & CATEGORIES:
        [${allPartNamesAndCategories}]

        EXAMPLES:
        - User Query: "pamp" -> Suggestions: ["Pump", "Pumps"]
        - User Query: "filtr" -> Suggestions: ["Filters", "Sediment Filter", "Carbon Block Filter"]
        - User Query: "meme" -> Suggestions: ["Membranes", "AquaPure Membrane 100GPD"]
        - User Query: "membr" -> Suggestions: ["Membranes", "AquaPure Membrane 100GPD"]
        - User Query: "मेंबराने" -> Suggestions: ["मेम्ब्रेन", "AquaPure Membrane 100GPD"]
        - User Query: "valv" -> Suggestions: ["Valves", "Solenoid Valve", "Auto Flush Valve"]
        - User Query: "xyz" -> Suggestions: []

        User Query: "${query}"
      `,
      config: {
        temperature: 0.1,
        responseFormat: 'json',
      },
    });

    try {
      // Ensure the response is valid JSON before attempting to parse.
      const textResponse = llmResponse.text.trim();
      if (textResponse.startsWith('[') && textResponse.endsWith(']')) {
        const parsed = JSON.parse(textResponse);
        if (Array.isArray(parsed)) {
          return {suggestions: parsed.filter(s => typeof s === 'string')};
        }
      }
    } catch (e) {
      console.error('Could not parse search suggestions:', e);
    }

    return {suggestions: []};
  }
);

export async function suggestSearchTerm(
  input: SuggestSearchTermInput
): Promise<SuggestSearchTermOutput> {
  return await suggestSearchTermFlow(input);
}
