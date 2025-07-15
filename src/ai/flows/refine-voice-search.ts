'use server';
/**
 * @fileOverview This file defines a Genkit flow for refining voice search transcripts.
 *
 * - refineVoiceSearch: A function that takes a raw voice transcript and refines it into a clean search query.
 * - RefineVoiceSearchInput: The input schema for the flow.
 * - RefineVoiceSearchOutput: The output schema for the flow.
 */
import {z} from 'zod';
import {ai} from '../genkit';

const RefineVoiceSearchInputSchema = z.object({
  transcript: z.string(),
});
export type RefineVoiceSearchInput = z.infer<
  typeof RefineVoiceSearchInputSchema
>;

const RefineVoiceSearchOutputSchema = z.object({
  refinedQuery: z.string(),
});
export type RefineVoiceSearchOutput = z.infer<
  typeof RefineVoiceSearchOutputSchema
>;

const refineVoiceSearchFlow = ai.defineFlow(
  {
    name: 'refineVoiceSearchFlow',
    inputSchema: RefineVoiceSearchInputSchema,
    outputSchema: RefineVoiceSearchOutputSchema,
  },
  async ({transcript}) => {
    const llmResponse = await ai.generate({
      prompt: `You are a helpful e-commerce search assistant for an RO (Reverse Osmosis) parts store.
Your task is to take a raw voice search transcript and convert it into a clean, effective search query.

Guidelines:
1.  **Extract Keywords**: Identify the main product or keyword from the transcript.
2.  **Remove Filler Words**: Ignore conversational phrases like "I'm looking for", "can you show me", "search for", etc.
3.  **Correct Common Misspellings/Mispronunciations**: Correct any spelling errors to match common product names (e.g., "member" or "membrane" should be "Membrane").
4.  **Be Concise**: The output should only be the refined search term.

Examples:
- Transcript: "I need a new water pump" -> Refined Query: "pump"
- Transcript: "show me filters for my RO" -> Refined Query: "filter"
- Transcript: "do you have a solenoid valve" -> Refined Query: "solenoid valve"
- Transcript: "I am looking for a aqua pure member" -> Refined Query: "AquaPure Membrane"

Transcript to process: "${transcript}"

Refined Query:
`,
      config: {
        temperature: 0.2,
      },
    });

    return {
      refinedQuery: llmResponse.text.trim(),
    };
  }
);

export async function refineVoiceSearch(
  input: RefineVoiceSearchInput
): Promise<RefineVoiceSearchOutput> {
  return await refineVoiceSearchFlow(input);
}
