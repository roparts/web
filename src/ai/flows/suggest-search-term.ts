
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting search terms with spelling correction.
 *
 * - suggestSearchTerm - A function that suggests a corrected or improved search term.
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
  suggestion: z.string().describe('A suggested search term. Should be empty if the original query is good.'),
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
Your task is to correct spelling mistakes in a user's search query and suggest a better term if possible, based on the list of available part names.

Rules:
- Analyze the user's query: "{{query}}".
- Compare it against the following list of available part names:
{{#each partNames}}
- {{this}}
{{/each}}
- If the query has a clear spelling mistake or is a very close partial match to a name in the list, provide the corrected or full name as a suggestion.
- If the query seems reasonable, is a generic term (e.g., "filter", "pump"), or doesn't have an obvious better alternative in the list, return an empty string for the suggestion.
- Only suggest terms that are highly relevant to the provided list of part names.

Examples:
- User Query: "membrain", Suggestion: "Membrane"
- User Query: "aquapur", Suggestion: "AquaPure"
- User Query: "filter", Suggestion: "" (empty string, as it's a valid generic term)
- User Query: "xyz", Suggestion: "" (empty string, as it has no match)
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
    if (input.query.trim().length < 3) {
      return { suggestion: '' };
    }
    const {output} = await suggestSearchTermPrompt(input);
    
    // Additional guard to prevent suggesting the exact same query back.
    if (output?.suggestion.toLowerCase() === input.query.toLowerCase()) {
      return { suggestion: '' };
    }
    
    return output!;
  }
);
