import { config } from 'dotenv';
config();

import '@/ai/flows/generate-part-description.ts';
import '@/ai/flows/suggest-related-parts.ts';
import '@/ai/flows/suggest-search-term.ts';
import '@/ai/flows/refine-voice-search.ts';
