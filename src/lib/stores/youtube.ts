// src/lib/stores/youtube.ts
import { writable } from 'svelte/store';

interface SummaryState {
	quickSummary: string | null;
	detailedSummary: string | null;
	isLoading: boolean;
	error: string | null;
}

const createYoutubeSummaryStore = () => {
	const { subscribe, set, update } = writable<SummaryState>({
		quickSummary: null,
		detailedSummary: null,
		isLoading: false,
		error: null
	});

	return {
		subscribe,
		startLoading: () => update((state) => ({ ...state, isLoading: true, error: null })),
		setError: (error: string) => update((state) => ({ ...state, error, isLoading: false })),
		setSummaries: (quick: string, detailed: string) =>
			update((state) => ({
				...state,
				quickSummary: quick,
				detailedSummary: detailed,
				isLoading: false,
				error: null
			})),
		reset: () =>
			set({
				quickSummary: null,
				detailedSummary: null,
				isLoading: false,
				error: null
			})
	};
};

export const youtubeSummary = createYoutubeSummaryStore();
