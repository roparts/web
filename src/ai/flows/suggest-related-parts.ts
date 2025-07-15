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
import {partsData} from '@/lib/parts-data';

const SuggestRelatedPartsInputSchema = z.object({
  partDescription: z.string(),
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

const allPartNames = partsData.map(p => p.name).join(', ');

const suggestRelatedPartsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedPartsFlow',
    inputSchema: SuggestRelatedPartsInputSchema,
    outputSchema: SuggestRelatedPartsOutputSchema,
  },
  async ({partDescription}) => {
    const llmResponse = await ai.generate({
      prompt: `You are an expert at recommending related products for an RO parts store.
Based on the provided part, suggest 3 other parts that are commonly bought with it or are functionally related.

Your suggestions MUST come from this list of available parts:
[${allPartNames}]

Do not suggest the original part itself.
Return ONLY a JSON array of the part names.

Original Part:
${partDescription}
`,
      config: {
        temperature: 0.3,
        responseFormat: 'json',
      },
    });

    try {
      const suggestions = JSON.parse(llmResponse.text);
      if (Array.isArray(suggestions)) {
        return {relatedParts: suggestions.slice(0, 3)};
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
