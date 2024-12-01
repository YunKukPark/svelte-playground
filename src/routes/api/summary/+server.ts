import { YoutubeTranscript } from 'youtube-transcript';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { anthropicClient } from '../config.js';
import { isTextBlock } from './type.js';
import { parseTranscriptXML } from './utils.js';

const MAX_VIDEO_DURATION = 20 * 60; // 20분을 초 단위로 변환

const fetchYoutubeTranscript = async (videoId: string) => {
	try {
		const transcript = await YoutubeTranscript.fetchTranscript(videoId);

		// 전체 동영상 길이 계산
		const totalDuration = transcript.reduce((acc, segment) => acc + (segment.duration || 0), 0);

		if (totalDuration > MAX_VIDEO_DURATION) {
			// 20분까지만 트랜스크립트 추출
			let currentDuration = 0;
			const trimmedTranscript = [];

			for (const segment of transcript) {
				if (currentDuration + (segment.duration || 0) > MAX_VIDEO_DURATION) {
					// 20분 초과 시 중단
					break;
				}
				trimmedTranscript.push(segment);
				currentDuration += segment.duration || 0;
			}

			// 잘린 트랜스크립트임을 표시
			return {
				transcript: trimmedTranscript,
				isTruncated: true,
				originalDuration: Math.floor(totalDuration / 60), // 분 단위로 변환
				truncatedDuration: Math.floor(currentDuration / 60)
			};
		}

		// 20분 이하의 영상은 전체 트랜스크립트 반환
		return {
			transcript: transcript,
			isTruncated: false,
			originalDuration: Math.floor(totalDuration / 60),
			truncatedDuration: Math.floor(totalDuration / 60)
		};
	} catch (error) {
		console.error('Error fetching transcript:', error);

		throw new Error('Failed to fetch transcript');
	}
};

const generateSummary = async (transcript: string, additionalPrompt?: string) => {
	try {
		const message = await anthropicClient.messages.create({
			model: 'claude-3-5-sonnet-latest',
			max_tokens: 4096,
			system: `You are an AI assistant that creates structured Korean summaries of YouTube video transcripts.
Your analysis should be thorough yet concise, focusing on delivering maximum value to Korean viewers.

Please analyze the transcript and create a summary following this structure:

1. Core Analysis Requirements:
   - Extract 3 most important key points
   - Provide detailed analysis of main concepts
   - Identify key terms and their meanings
   - Note timestamps for significant moments
   - Capture any actionable takeaways
   - summary에는 3개의 핵심 포인트만 포함하면 됩니다만 detailed_summary에는 모든 키워드를 포함해야 합니다.

2. Response Format Requirements:
   - Use ONLY Korean language in the response
   - Follow the strict XML structure provided
   - Ensure all tags are properly closed
   - Include ALL mandatory sections

Please format your response using this exact XML structure:

<transcript_summary>
    <metadata>
        <title>{영상의 제목}</title>
        <duration>{영상 길이}</duration>
        <language>ko</language>
    </metadata>
    
    <brief_summary>
        <point_1>{가장 중요한 핵심 포인트}</point_1>
        <point_2>{두 번째 핵심 포인트}</point_2>
        <point_3>{세 번째 핵심 포인트}</point_3>
    </brief_summary>
    
    <detailed_summary>
        <section>
            <heading>{주제/섹션 제목}</heading>
            <content>{상세 내용}</content>
            <timestamp>{관련 타임스탬프}</timestamp>
        </section>
    </detailed_summary>
    
    <key_terms>
        <term>
            <name>{주요 용어}</name>
            <definition>{용어 설명}</definition>
        </term>
    </key_terms>
    
    <action_items>
        <item>{실행 가능한 조치사항}</item>
    </action_items>
</transcript_summary>`,
			messages: [
				{
					role: 'user',
					content: `Please summarize the following transcript:
          ${transcript}
          ${additionalPrompt ? `\nAdditional instructions: <additional_instruction>${additionalPrompt}</additional_instruction>` : ''}`
				}
			]
		});

		// content가 없거나 비어있는 경우 처리
		if (!message.content || message.content.length === 0) {
			throw new Error('No content in response');
		}

		// 첫 번째 content 블록이 text 타입인지 확인
		const firstBlock = message.content[0];
		if (!isTextBlock(firstBlock)) {
			throw new Error('First content block is not text');
		}

		const content = firstBlock.text;

		// XML 파싱
		return await parseTranscriptXML(content);
	} catch (error) {
		console.error('Error generating summary:', error);
		throw new Error('Failed to generate summary');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { videoId, prompt } = await request.json();

		if (!videoId) {
			throw error(400, 'Video ID is required');
		}

		const { transcript } = await fetchYoutubeTranscript(videoId);

		const fullText = transcript.map(({ text }) => text).join(' ');
		const summaries = await generateSummary(fullText, prompt);

		return json(summaries);
	} catch (err) {
		console.error('Error processing request:', err);
		throw error(500, 'Failed to generate summary');
	}
};
