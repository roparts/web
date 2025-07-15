'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating descriptions for RO parts using AI.
 *
 * - generatePartDescription - A function that generates a part description.
 * - GeneratePartDescriptionInput - The input type for the generatePartDescription function.
 * - GeneratePartDescriptionOutput - The return type for the generatePartDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePartDescriptionInputSchema = z.object({
  partName: z.string().describe('The name of the RO part.'),
  partCategory: z.string().describe('The category of the RO part.'),
  partFeatures: z.string().describe('The features of the RO part.'),
});
export type GeneratePartDescriptionInput = z.infer<typeof GeneratePartDescriptionInputSchema>;

const GeneratePartDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling and informative description of the RO part.'),
  relatedParts: z.array(z.string()).describe('Suggested related parts based on the current selection.'),
});
export type GeneratePartDescriptionOutput = z.infer<typeof GeneratePartDescriptionOutputSchema>;

export async function generatePartDescription(input: GeneratePartDescriptionInput): Promise<GeneratePartDescriptionOutput> {
  return generatePartDescriptionFlow(input);
}

const generatePartDescriptionPrompt = ai.definePrompt({
  name: 'generatePartDescriptionPrompt',
  input: {schema: GeneratePartDescriptionInputSchema},
  output: {schema: GeneratePartDescriptionOutputSchema},
  prompt: `You are an AI assistant that generates descriptions and suggests related parts for RO parts.

  Given the part name, category and its features, generate a compelling and informative description for the RO part.
  Also, suggest related parts based on the current selection.

  Part Name: {{{partName}}}
  Part Category: {{{partCategory}}}
  Part Features: {{{partFeatures}}}
  `,
});

const generatePartDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePartDescriptionFlow',
    inputSchema: GeneratePartDescriptionInputSchema,
    outputSchema: GeneratePartDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generatePartDescriptionPrompt(input);
    return output!;
  }
);
