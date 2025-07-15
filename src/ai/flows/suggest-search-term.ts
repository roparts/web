
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting search terms with spelling correction and autocompletion.
 *
 * - suggestSearchTerm - A function that suggests corrected or improved search terms.
 * - SuggestSearchTermInput - The input type for the suggestSearchTerm function.
 * - SuggestSearchTermOutput - The return type for the suggestSearchTerm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { partsData } from '@/lib/parts-data';

const SuggestSearchTermInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
  partNames: z.array(z.string()).describe('A list of all available part names in English.'),
  partNamesHi: z.array(z.string()).describe('A list of all available part names in Hindi.'),
});
export type SuggestSearchTermInput = z.infer<typeof SuggestSearchTermInputSchema>;

const SuggestSearchTermOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of up to 5 suggested search terms, including corrections and completions.'),
});
export type SuggestSearchTermOutput = z.infer<typeof SuggestSearchTermOutputSchema>;

export async function suggestSearchTerm(input: { query: string }): Promise<SuggestSearchTermOutput> {
  const partNames = partsData.map(p => p.name);
  const partNamesHi = partsData.map(p => p.name_hi || '').filter(Boolean);
  return suggestSearchTermFlow({ ...input, partNames, partNamesHi });
}

const suggestSearchTermPrompt = ai.definePrompt({
  name: 'suggestSearchTermPrompt',
  input: {schema: SuggestSearchTermInputSchema},
  output: {schema: SuggestSearchTermOutputSchema},
  prompt: `You are a search assistant for an online store that sells RO (Reverse Osmosis) parts in both English and Hindi.
Your task is to provide a list of relevant search suggestions based on a user's query and a list of available part names.

Rules:
- Analyze the user's query: "{{query}}".
- The user might type in English, Hindi, or a mix (Hinglish).
- Compare the query against the available English and Hindi part names.
- English Part Names: {{#each partNames}}- {{this}}{{/each}}
- Hindi Part Names: {{#each partNamesHi}}- {{this}}{{/each}}
- Provide a list of up to 5 suggestions.
- The suggestions should include potential spelling corrections, autocompletions of part names, or broader relevant categories.
- If the query has no relevant matches or is too generic (e.g., "part", "पार्ट"), return an empty list of suggestions.
- Do not suggest the exact same term as the query.
- If the user's query is in Hindi, provide suggestions in Hindi. If it's in English, provide suggestions in English.

Examples (English):
- User Query: "membrain", Suggestions: ["Membrane", "AquaPure Membrane 100GPD"]
- User Query: "aqua", Suggestions: ["AquaPure", "AquaPure Carbon Block Filter", "AquaPure Membrane 100GPD"]
- User Query: "filter", Suggestions: ["HydroFlow Sediment Filter", "AquaPure Carbon Block Filter", "EcoWater Mineral Cartridge"]
- User Query: "xyz", Suggestions: []

Examples (Hindi):
- User Query: "मेंबराने", Suggestions: ["मेम्ब्रेन", "एक्वाप्योर मेम्ब्रेन 100GPD"]
- User Query: "मेमबरेन", Suggestions: ["मेम्ब्रेन", "एक्वाप्योर मेम्ब्रेन 100GPD"]
- User Query: "फिल्टर", Suggestions: ["हाइड्रोफ्लो सेडिमेंट फ़िल्टर", "एक्वाप्योर कार्बन ब्लॉक फ़िल्टर", "इकोवाटर मिनरल कार्ट्रिज"]
- User Query: "पमप", Suggestions: ["पंप", "प्योरस्ट्रीम बूस्टर पंप"]
- User Query: "एकवा", Suggestions: ["एक्वाप्योर", "एक्वाप्योर कार्बन ब्लॉक फ़िल्टर", "एक्वाप्योर मेम्ब्रेन 100GPD"]
`,
});

const suggestSearchTermFlow = ai.defineFlow(
  {
    name: 'suggestSearchTermFlow',
    inputSchema: SuggestSearchTermInputSchema,
    outputSchema: SuggestSearchTermOutputSchema,
  },
  async input => {
    // Don't call the AI for very short or empty queries.
    if (input.query.trim().length < 2) {
      return { suggestions: [] };
    }
    const {output} = await suggestSearchTermPrompt(input);
    
    // Filter out suggestions that are the same as the query
    if (output?.suggestions) {
      output.suggestions = output.suggestions.filter(s => s.toLowerCase() !== input.query.toLowerCase());
    }
    
    return output || { suggestions: [] };
  }
);
