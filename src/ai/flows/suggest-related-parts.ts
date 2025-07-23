
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting related parts.
 *
 * - suggestRelatedParts: A function that suggests related parts based on a given part's description.
 * - SuggestRelatedPartsInput: The input schema for the flow.
 * - SuggestRelatedPartsOutput: The output schema for the flow.
 */

import {z} from 'zod';
import {ai} from '../genkit';
import { googleAI } from '@genkit-ai/googleai';

const SuggestRelatedPartsInputSchema = z.object({
  partId: z.string(),
  partCategory: z.string(),
  partDescription: z.string(),
  allPartNames: z.array(z.string()), // Pass all available part names to the flow
});
export type SuggestRelatedPartsInput = z.infer<
  typeof SuggestRelatedPartsInputSchema
>;

const SuggestRelatedPartsOutputSchema = z.object({
  relatedParts: z.array(z.string()),
});
export type SuggestRelatedPartsOutput = z.infer<
  typeof SuggestRelatedPartsOutputSchema
>;

const suggestRelatedPartsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedPartsFlow',
    inputSchema: SuggestRelatedPartsInputSchema,
    outputSchema: SuggestRelatedPartsOutputSchema,
  },
  async ({partId, partCategory, partDescription, allPartNames}) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are an expert at recommending related products for a Reverse Osmosis (RO) parts store.
Based on the provided part, suggest 3 other parts that are commonly bought with it or are functionally related.
For example, a membrane should be paired with a housing. A filter might be paired with a different type of filter (e.g., sediment with carbon).

Your suggestions MUST come from this list of available parts:
[${allPartNames.join(', ')}]

Do not suggest the original part itself or parts from the exact same category unless it makes functional sense (e.g., different types of filters).
Return ONLY a JSON array of the part names.

Original Part Details:
- ID: ${partId}
- Category: ${partCategory}
- Description: ${partDescription}
`,
      config: {
        temperature: 0.5,
        responseFormat: 'json',
      },
    });

    try {
      // Ensure the response is valid JSON before attempting to parse.
      const textResponse = llmResponse.text.trim();
       if (textResponse.startsWith('[') && textResponse.endsWith(']')) {
        const parsed = JSON.parse(textResponse);
        if (Array.isArray(parsed)) {
            // Filter out any non-string values just in case
            const suggestions = parsed.filter(s => typeof s === 'string');
            return {relatedParts: suggestions.slice(0, 3)};
        }
      }
    } catch (e) {
      console.error('Failed to parse related parts suggestions:', e);
    }

    return {relatedParts: []};
  }
);

export async function suggestRelatedParts(
  input: SuggestRelatedPartsInput
): Promise<SuggestRelatedPartsOutput> {
  return await suggestRelatedPartsFlow(input);
}
