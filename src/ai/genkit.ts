/**
 * @fileoverview This file configures and exports the Genkit AI instance.
 *
 * It initializes the Genkit library with the Google AI plugin, making it
 * available for use in the rest of the application. The exported `ai`
 * object is the central point for defining and running AI flows.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
});
