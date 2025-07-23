
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a product image.
 *
 * - generatePartImage: A function that generates a product image based on its name and description.
 * - GeneratePartImageInput: The input schema for the flow.
 * - GeneratePartImageOutput: The output schema for the flow.
 */
import {z} from 'zod';
import {ai} from '../genkit';
import {googleAI} from '@genkit-ai/googleai';

const GeneratePartImageInputSchema = z.object({
  partName: z.string(),
  partCategory: z.string(),
});
export type GeneratePartImageInput = z.infer<
  typeof GeneratePartImageInputSchema
>;

const GeneratePartImageOutputSchema = z.object({
  imageDataUri: z.string(),
});
export type GeneratePartImageOutput = z.infer<
  typeof GeneratePartImageOutputSchema
>;

const generatePartImageFlow = ai.defineFlow(
  {
    name: 'generatePartImageFlow',
    inputSchema: GeneratePartImageInputSchema,
    outputSchema: GeneratePartImageOutputSchema,
  },
  async ({partName, partCategory}) => {
    // Note: Image generation can take a few seconds.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a professional, high-quality, photorealistic product photograph of a single '${partName}' against a clean, plain, light-colored studio background. The item should be the only subject. The item is a type of '${partCategory}'. Do not include any text or logos.`,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    const imageDataUri = media?.url ?? '';

    if (!imageDataUri) {
      throw new Error('Image generation failed to produce an image.');
    }

    return {
      imageDataUri,
    };
  }
);

export async function generatePartImage(
  input: GeneratePartImageInput
): Promise<GeneratePartImageOutput> {
  return await generatePartImageFlow(input);
}
