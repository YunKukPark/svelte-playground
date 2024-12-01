// src/lib/queries/youtube.ts
import axios from 'axios';
import type { QueryFunction } from '@tanstack/svelte-query';
import type { TranscriptSummary } from '../../routes/api/summary/type.js';

interface SummaryParams {
	videoId: string;
	prompt?: string;
}

export const getSummary: QueryFunction<TranscriptSummary, [string, SummaryParams]> = async ({
	queryKey
}) => {
	const [, params] = queryKey;
	const { data } = await axios.post<TranscriptSummary>('/api/summary', params);
	console.log('data: ', data);
	return data;
};
