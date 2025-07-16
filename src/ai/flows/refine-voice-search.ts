
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
      prompt: `You are a search entity mapping assistant for an RO (Reverse Osmosis) parts store.
Your ONLY task is to find the single best matching keyword from the provided list for the user's voice transcript.

STRICT RULES:
1.  Analyze the user's transcript (which may be in English, Hindi, or Hinglish) for the most likely product or category they are asking for.
2.  Find the single best, most relevant keyword from the "AVAILABLE KEYWORDS" list.
3.  Consider common misspellings, mispronunciations, and transliterations (e.g., "pamp" -> "Pump", "filtr" -> "Filter", "मेंबराने" -> "मेम्ब्रेन").
4.  If a clear match is found, your response MUST be the exact keyword from the list.
5.  If you cannot find a clear match, return the original transcript. Do not guess or make up a keyword.
6.  Your output MUST ONLY be the single matched keyword or the original transcript. No other text.

AVAILABLE KEYWORDS:
[${allKeywords.join(', ')}]

EXAMPLES:
- Transcript: "I need a new water pump" -> Refined Query: "Pump (Booster Pump)"
- Transcript: "show me filters for my RO" -> Refined Query: "Pre-Filters / Sediment"
- Transcript: "membrane dikhao" -> Refined Query: "RO Membranes"
- Transcript: "मेंबराने" -> Refined Query: "मेम्ब्रेन"
- Transcript: "75 gpd wala vontron" -> Refined Query: "75 GPD RO Membrane - Vontron Brand"
- Transcript: "aqua pure" -> Refined Query: "aqua pure" (No clear match from list)

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
