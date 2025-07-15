
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
  partNames: z.array(z.string()).describe('A list of all available part names.'),
});
export type SuggestSearchTermInput = z.infer<typeof SuggestSearchTermInputSchema>;

const SuggestSearchTermOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of up to 5 suggested search terms, including corrections and completions.'),
});
export type SuggestSearchTermOutput = z.infer<typeof SuggestSearchTermOutputSchema>;

export async function suggestSearchTerm(input: { query: string }): Promise<SuggestSearchTermOutput> {
  const partNames = partsData.map(p => p.name);
  return suggestSearchTermFlow({ ...input, partNames });
}

const suggestSearchTermPrompt = ai.definePrompt({
  name: 'suggestSearchTermPrompt',
  input: {schema: SuggestSearchTermInputSchema},
  output: {schema: SuggestSearchTermOutputSchema},
  prompt: `You are a search assistant for an online store that sells RO (Reverse Osmosis) parts.
Your task is to provide a list of relevant search suggestions based on a user's query and a list of available part names.

Rules:
- Analyze the user's query: "{{query}}".
- Compare it against the following list of available part names:
{{#each partNames}}
- {{this}}
{{/each}}
- Provide a list of up to 5 suggestions.
- The suggestions should include potential spelling corrections, autocompletions of part names, or broader relevant categories.
- If the query is a good and complete term (e.g., "Membrane"), you can still suggest more specific part names that match.
- If the query has no relevant matches or is too generic (e.g., "part"), return an empty list of suggestions.
- Do not suggest the exact same term as the query.

Examples:
- User Query: "membrain", Suggestions: ["Membrane", "AquaPure Membrane 100GPD"]
- User Query: "aqua", Suggestions: ["AquaPure", "AquaPure Carbon Block Filter", "AquaPure Membrane 100GPD"]
- User Query: "filter", Suggestions: ["HydroFlow Sediment Filter", "AquaPure Carbon Block Filter", "EcoWater Mineral Cartridge"]
- User Query: "xyz", Suggestions: []
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
