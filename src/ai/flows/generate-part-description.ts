'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a product description.
 *
 * - generatePartDescription: A function that generates a compelling product description based on part details.
 * - GeneratePartDescriptionInput: The input schema for the flow.
 * - GeneratePartDescriptionOutput: The output schema for the flow.
 */
import {z} from 'zod';
import {ai} from '../genkit';

const GeneratePartDescriptionInputSchema = z.object({
  partName: z.string(),
  partCategory: z.string(),
  partFeatures: z.string(),
});
export type GeneratePartDescriptionInput = z.infer<
  typeof GeneratePartDescriptionInputSchema
>;

const GeneratePartDescriptionOutputSchema = z.object({
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
      prompt: `You are a product marketing expert for an e-commerce store that sells Reverse Osmosis (RO) parts.
Your task is to write a concise, compelling, and SEO-friendly product description.

Guidelines:
1.  **Start Strong**: Begin with a clear statement of what the product is.
2.  **Highlight Benefits**: Focus on how the features benefit the customer (e.g., "ensuring pure water" instead of just "high rejection rate").
3.  **Incorporate Keywords**: Naturally include the part name, category, and key features.
4.  **Keep it Concise**: Aim for 1-2 sentences.
5.  **Output**: Respond with only the generated description text.

Part Details:
- Name: ${partName}
- Category: ${partCategory}
- Features: ${partFeatures}

Description:
`,
      config: {
        temperature: 0.7,
      },
    });

    return {
      description: llmResponse.text.trim(),
    };
  }
);

export async function generatePartDescription(
  input: GeneratePartDescriptionInput
): Promise<GeneratePartDescriptionOutput> {
  return await generatePartDescriptionFlow(input);
}
