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
	<title>AI Youtube Docent</title>
	<meta property="og:title" content="AI YouTube Docent" />
	<meta
		property="og:image"
		content="https://github.com/user-attachments/assets/24dc1bae-93ba-48db-ae61-04ca31d72361"
	/>
	<meta property="og:description" content="YouTube 동영상의 AI 요약을 받아보세요" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
