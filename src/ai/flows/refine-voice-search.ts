'use server';

/**
 * @fileOverview This file defines a Genkit flow for refining a voice search query.
 *
 * - refineVoiceSearch - A function that takes a raw voice transcript and returns a clean, relevant search term.
 * - RefineVoiceSearchInput - The input type for the refineVoiceSearch function.
 * - RefineVoiceSearchOutput - The return type for the refineVoiceSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { partsData } from '@/lib/parts-data';

const RefineVoiceSearchInputSchema = z.object({
  transcript: z.string().describe('The raw transcript from the voice recognition API.'),
  partNames: z.array(z.string()).describe('A list of all available part names in English.'),
  partNamesHi: z.array(z.string()).describe('A list of all available part names in Hindi.'),
});
export type RefineVoiceSearchInput = z.infer<typeof RefineVoiceSearchInputSchema>;

const RefineVoiceSearchOutputSchema = z.object({
  refinedQuery: z.string().describe('The refined search query, corrected for spelling and with filler words removed.'),
});
export type RefineVoiceSearchOutput = z.infer<typeof RefineVoiceSearchOutputSchema>;

export async function refineVoiceSearch(input: { transcript: string }): Promise<RefineVoiceSearchOutput> {
  const partNames = partsData.map(p => p.name);
  const partNamesHi = partsData.map(p => p.name_hi || '').filter(Boolean);
  return refineVoiceSearchFlow({ ...input, partNames, partNamesHi });
}

const refineVoiceSearchPrompt = ai.definePrompt({
  name: 'refineVoiceSearchPrompt',
  input: {schema: RefineVoiceSearchInputSchema},
  output: {schema: RefineVoiceSearchOutputSchema},
  prompt: `You are a search query refinement expert for an RO parts store.
Your task is to take a raw voice search transcript and convert it into a clean, relevant search query.

Rules:
- Analyze the user's transcript: "{{transcript}}".
- The user might speak in English, Hindi, or Hinglish.
- Your main goal is to extract the core product name or category the user is asking for.
- Remove all conversational filler words (e.g., "I'm looking for", "can you show me", "search for", "बताइए", "दिखाओ").
- Correct any spelling or pronunciation errors to match the closest available part name from the lists provided.
- If the transcript is a clear product name, just return that name.
- If no relevant product term can be extracted, return an empty string for the refinedQuery.

Available English Part Names: {{#each partNames}}- {{this}}{{/each}}
Available Hindi Part Names: {{#each partNamesHi}}- {{this}}{{/each}}

Examples (English):
- Transcript: "I need a new membrane" -> refinedQuery: "Membrane"
- Transcript: "show me the aqua pure filter" -> refinedQuery: "AquaPure Carbon Block Filter"
- Transcript: "hydro flow sediment" -> refinedQuery: "HydroFlow Sediment Filter"

Examples (Hindi):
- Transcript: "मुझे मेंबराने चाहिए" -> refinedQuery: "मेम्ब्रेन"
- Transcript: "पंप दिखाओ" -> refinedQuery: "पंप"
- Transcript: "एक्वाप्योर मेम्ब्रेन" -> refinedQuery: "एक्वाप्योर मेम्ब्रेन 100GPD"
`,
});

const refineVoiceSearchFlow = ai.defineFlow(
  {
    name: 'refineVoiceSearchFlow',
    inputSchema: RefineVoiceSearchInputSchema,
    outputSchema: RefineVoiceSearchOutputSchema,
  },
  async input => {
    if (!input.transcript.trim()) {
        return { refinedQuery: "" };
    }
    const {output} = await refineVoiceSearchPrompt(input);
    return output || { refinedQuery: "" };
  }
);
