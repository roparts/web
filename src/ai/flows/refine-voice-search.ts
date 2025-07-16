
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
import { partsData } from '@/lib/parts-data';

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

// Create a comprehensive list of all searchable keywords from the product data.
const allKeywords = [
  ...new Set([
    ...partsData.map(p => p.name),
    ...partsData.map(p => p.name_hi || '').filter(Boolean),
    ...partsData.map(p => p.subcategory),
    ...partsData.map(p => p.brand || '').filter(Boolean),
  ]),
];

const refineVoiceSearchFlow = ai.defineFlow(
  {
    name: 'refineVoiceSearchFlow',
    inputSchema: RefineVoiceSearchInputSchema,
    outputSchema: RefineVoiceSearchOutputSchema,
  },
  async ({transcript}) => {
    const llmResponse = await ai.generate({
      prompt: `You are a search term translator and entity mapper for an RO (Reverse Osmosis) parts store.
Your ONLY task is to identify the product or category in the user's voice transcript and return its corresponding ENGLISH name from the provided list.

STRICT RULES:
1. Analyze the user's transcript (which may be in English, Hindi, or Hinglish).
2. Find the single best, most relevant keyword from the "AVAILABLE KEYWORDS" list that matches the user's intent.
3. YOUR RESPONSE MUST BE THE EXACT **ENGLISH** NAME for the matched entity. Do not return the Hindi name.
4. Consider common misspellings, mispronunciations, and transliterations.
5. If a clear match is found, return the corresponding English keyword.
6. If you cannot find a clear match, return the original transcript.
7. Your output MUST ONLY be the single matched English keyword or the original transcript. No other text.

AVAILABLE KEYWORDS (includes both English and Hindi terms for your reference):
[${allKeywords.join(', ')}]

EXAMPLES:
- Transcript: "I need a new water pump" -> Refined Query: "Pump (Booster Pump)"
- Transcript: "show me filters for my RO" -> Refined Query: "Pre-Filters / Sediment"
- Transcript: "membrane dikhao" -> Refined Query: "RO Membranes"
- Transcript: "मेंबराने" -> Refined Query: "RO Membranes"
- Transcript: "75 gpd wala vontron" -> Refined Query: "75 GPD RO Membrane - Vontron Brand"
- Transcript: "aqua pure" -> Refined Query: "aqua pure" (No clear match from list)
- Transcript: "solenoid valv" -> Refined Query: "Solenoid Valve"

Transcript to process: "${transcript}"

Refined Query:
`,
      config: {
        temperature: 0.1,
      },
    });

    // Fallback to original transcript if the model returns an empty or nonsensical response.
    const refinedQuery = llmResponse.text.trim() || transcript;
    
    return {
      refinedQuery,
    };
  }
);

export async function refineVoiceSearch(
  input: RefineVoiceSearchInput
): Promise<RefineVoiceSearchOutput> {
  return await refineVoiceSearchFlow(input);
}
