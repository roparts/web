// src/ai/flows/suggest-related-parts.ts
'use server';

/**
 * @fileOverview AI-powered related parts suggestion flow.
 *
 * This file defines a Genkit flow that suggests related RO parts based on a given part's details.
 * It takes a part description as input and returns a list of suggested related parts.
 *
 * @module src/ai/flows/suggest-related-parts
 *
 * @interface SuggestRelatedPartsInput - The input type for the suggestRelatedParts function.
 * @interface SuggestRelatedPartsOutput - The output type for the suggestRelatedParts function.
 * @function suggestRelatedParts - A function that suggests related parts based on the input.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedPartsInputSchema = z.object({
  partDescription: z
    .string()
    .describe('The description of the RO part for which to suggest related parts.'),
  currentParts: z.array(z.string()).optional().describe('List of current part names in cart for context')
});
export type SuggestRelatedPartsInput = z.infer<typeof SuggestRelatedPartsInputSchema>;

const SuggestRelatedPartsOutputSchema = z.object({
  relatedParts: z
    .array(z.string())
    .describe('A list of suggested related RO parts based on the input part description.'),
});
export type SuggestRelatedPartsOutput = z.infer<typeof SuggestRelatedPartsOutputSchema>;

export async function suggestRelatedParts(input: SuggestRelatedPartsInput): Promise<SuggestRelatedPartsOutput> {
  return suggestRelatedPartsFlow(input);
}

const suggestRelatedPartsPrompt = ai.definePrompt({
  name: 'suggestRelatedPartsPrompt',
  input: {schema: SuggestRelatedPartsInputSchema},
  output: {schema: SuggestRelatedPartsOutputSchema},
  prompt: `You are an expert in RO parts and accessories. Given a description of a RO part, suggest other parts that would be related or complementary. Provide the part names in a list.

Part Description: {{{partDescription}}}
{{#if currentParts}}
Consider these parts are already in the user's cart: {{currentParts}}
Avoid suggesting parts already present.
{{/if}}
Related Parts:`, // Modified prompt to handle optional currentParts
});

const suggestRelatedPartsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedPartsFlow',
    inputSchema: SuggestRelatedPartsInputSchema,
    outputSchema: SuggestRelatedPartsOutputSchema,
  },
  async input => {
    const {output} = await suggestRelatedPartsPrompt(input);
    return output!;
  }
);
