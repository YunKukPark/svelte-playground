import type { ContentBlock, TextBlock } from '@anthropic-ai/sdk/resources/messages.mjs';

export interface TranscriptMetadata {
	title: string;
	duration: string;
	language: string;
}

export interface BriefPoint {
	content: string;
}

export interface Section {
	heading: string;
	content: string;
	timestamp: string;
}

export interface Term {
	name: string;
	definition: string;
}

export interface TranscriptSummary {
	metadata: TranscriptMetadata;
	briefSummary: BriefPoint[];
	detailedSummary: Section[];
	keyTerms: Term[];
	actionItems: string[];
}

export const isTextBlock = (block: ContentBlock): block is TextBlock => {
	return block.type === 'text';
};
