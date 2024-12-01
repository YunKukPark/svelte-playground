<script lang="ts">
	import { getSummary } from '$lib/queries/youtube.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { fade } from 'svelte/transition';
	import { marked } from 'marked';

	let youtubeUrl = '';
	let prompt = '';
	let videoId = '';

	const extractVideoId = (url: string) => {
		const regex =
			/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
		const match = url.match(regex);
		return match ? match[1] : '';
	};

	$: videoId = extractVideoId(youtubeUrl);

	$: summaryQuery = createQuery({
		queryKey: ['summary', { videoId, prompt }],
		queryFn: getSummary,
		enabled: false
	});

	const renderMarkdown = (content: string) => {
		return marked(content);
	};

	const handleSubmit = async () => {
		await $summaryQuery.refetch();
	};
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-lg space-y-6">
		<!-- Header -->
		<header class="text-center">
			<h1 class="text-2xl font-semibold text-gray-900">YouTube Summary</h1>
			<p class="mt-2 text-sm text-gray-600">YouTube 동영상의 AI 요약을 받아보세요</p>
		</header>

		<!-- YouTube Embed -->
		{#if videoId}
			<div transition:fade class="aspect-video overflow-hidden rounded-lg bg-gray-100">
				<iframe
					src={`https://www.youtube.com/embed/${videoId}`}
					title="YouTube video player"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
					class="h-full w-full"
				></iframe>
			</div>
		{/if}

		<!-- Input Form -->
		<div class="space-y-4 rounded-lg bg-white p-6 shadow-sm">
			<div class="space-y-2">
				<label for="youtube-url" class="block text-sm font-medium text-gray-700">
					YouTube URL
				</label>
				<input
					id="youtube-url"
					type="text"
					bind:value={youtubeUrl}
					placeholder="https://www.youtube.com/watch?v=..."
					class="w-full rounded-md border border-gray-200 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<div class="space-y-2">
				<label for="prompt" class="block text-sm font-medium text-gray-700">
					추가로 더 물어보고 싶은걸 여기에 적어주세요 (선택 사항)
				</label>
				<textarea
					id="prompt"
					bind:value={prompt}
					placeholder="예: 기술적인 세부사항에 집중해 주세요, 주요 포인트를 요약해 주세요..."
					rows="3"
					class="w-full rounded-md border border-gray-200 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
				></textarea>
			</div>

			<button
				on:click={handleSubmit}
				disabled={!videoId || $summaryQuery.isLoading}
				class="w-full rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>요약 생성</button
			>
		</div>

		<!-- Summary Sections -->
		{#if $summaryQuery.isSuccess && $summaryQuery.data}
			<div class="space-y-4">
				<!-- Quick Summary Section -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-3 text-lg font-medium text-gray-900">3-Line Summary</h2>
					<ul class="space-y-2">
						{#each $summaryQuery.data.briefSummary as item}
							<li class="text-gray-700">{item.content}</li>
						{/each}
					</ul>
				</div>

				<!-- Detailed Summary Section -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-3 text-lg font-medium text-gray-900">Detailed Summary</h2>
					<div class="space-y-4">
						{#each $summaryQuery.data.detailedSummary as section}
							<div class="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
								<h3 class="mb-2 font-medium text-gray-800">{section.heading}</h3>
								<!-- 마크다운 렌더링 적용 -->
								{@html renderMarkdown(section.content)}
								<span class="mt-1 text-sm text-gray-400">타임스탬프: {section.timestamp}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Key Terms Section -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-3 text-lg font-medium text-gray-900">주요 용어</h2>
					<dl class="space-y-3">
						{#each $summaryQuery.data.keyTerms as term}
							<div>
								<dt class="font-medium text-gray-800">{term.name}</dt>
								<dd class="text-gray-600">{term.definition}</dd>
							</div>
						{/each}
					</dl>
				</div>

				<!-- Action Items Section -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-3 text-lg font-medium text-gray-900">실행 항목</h2>
					<ul class="list-disc space-y-2 pl-5">
						{#each $summaryQuery.data.actionItems as item}
							<li class="text-gray-700">{item}</li>
						{/each}
					</ul>
				</div>
			</div>
		{:else if $summaryQuery.isLoading}
			<div class="space-y-4">
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-3 text-lg font-medium text-gray-900">요약 생성 중...</h2>
					<div class="h-24 animate-pulse rounded-md bg-gray-50"></div>
				</div>
			</div>
		{:else if $summaryQuery.isError}
			<div class="rounded-lg bg-red-50 p-6 text-red-600">
				요약을 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.
			</div>
		{/if}
	</div>
</div>
