
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating product descriptions.
 *
 * - generatePartDescription: A function to generate a description for a part based on its name, category, and features.
 * - GeneratePartDescriptionInput: The input schema for the flow.
 * - GeneratePartDescriptionOutput: The output schema for the flow.
 */

import {z} from 'zod';
import {ai} from '../genkit';

export const GeneratePartDescriptionInputSchema = z.object({
  partName: z.string(),
  partCategory: z.string(),
  partFeatures: z.string(),
});
export type GeneratePartDescriptionInput = z.infer<
  typeof GeneratePartDescriptionInputSchema
>;

export const GeneratePartDescriptionOutputSchema = z.object({
  description: z.string(),
});
export type GeneratePartDescriptionOutput = z.infer<
  typeof GeneratePartDescriptionOutputSchema
>;

const generatePartDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePartDescriptionFlow',
    inputSchema: GeneratePartDescriptionInputSchema,
    outputSchema: GeneratePartDescriptionOutputSchema,
  },
  async ({partName, partCategory, partFeatures}) => {
    const llmResponse = await ai.generate({
      prompt: `Generate a compelling, one-paragraph product description for an RO system part.
        The description should be concise, professional, and highlight the key benefits.

        Part Details:
        - Name: ${partName}
        - Category: ${partCategory}
        - Key Features: ${partFeatures}

        Description:`,
      config: {
        temperature: 0.5,
      },
    });

    return {
      description: llmResponse.text,
    };
  }
);

export async function generatePartDescription(
  input: GeneratePartDescriptionInput
): Promise<GeneratePartDescriptionOutput> {
  return await generatePartDescriptionFlow(input);
}
