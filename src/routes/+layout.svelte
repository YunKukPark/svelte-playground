<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let { children } = $props();

	// QueryClient 인스턴스 생성
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				gcTime: 1000 * 60 * 30
			}
		}
	});
</script>

<svelte:head>
	<title>YouTube Summary</title>
	<meta name="description" content="YouTube 동영상의 AI 요약을 받아보세요" />
	<meta name="robots" content="noindex, nofollow" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
	/>
	<style>
		.aspect-video {
			padding-top: 56.25%;
		}
	</style>
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
