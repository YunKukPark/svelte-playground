import { ANTHROPIC_API_KEY } from '$lib/config/env.js';
import Anthropic from '@anthropic-ai/sdk';

export const anthropicClient = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});
