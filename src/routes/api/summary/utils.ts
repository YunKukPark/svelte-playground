import { Parser } from 'htmlparser2';
import type { Section, Term, TranscriptSummary } from './type.js';

export const parseTranscriptXML = (xmlContent: string): Promise<TranscriptSummary> => {
	return new Promise((resolve, reject) => {
		const result: TranscriptSummary = {
			metadata: { title: '', duration: '', language: '' },
			briefSummary: [],
			detailedSummary: [],
			keyTerms: [],
			actionItems: []
		};

		let currentElement = '';
		let currentSection: Partial<Section> = {};
		let currentTerm: Partial<Term> = {};
		let isInBriefSummary = false;
		let isInDetailedSummary = false;
		let isInKeyTerms = false;
		let isInActionItems = false;

		const parser = new Parser(
			{
				onopentag(name) {
					currentElement = name;

					switch (name) {
						case 'brief_summary':
							isInBriefSummary = true;
							break;
						case 'detailed_summary':
							isInDetailedSummary = true;
							break;
						case 'section':
							currentSection = {};
							break;
						case 'term':
							currentTerm = {};
							break;
						case 'key_terms':
							isInKeyTerms = true;
							break;
						case 'action_items':
							isInActionItems = true;
							break;
					}
				},

				ontext(text) {
					const trimmedText = text.trim();
					if (!trimmedText) return;

					if (currentElement.startsWith('point_') && isInBriefSummary) {
						result.briefSummary.push({ content: trimmedText });
					} else if (isInDetailedSummary) {
						switch (currentElement) {
							case 'heading':
								currentSection.heading = trimmedText;
								break;
							case 'content':
								currentSection.content = trimmedText;
								break;
							case 'timestamp':
								currentSection.timestamp = trimmedText;
								break;
						}
					} else if (isInKeyTerms) {
						switch (currentElement) {
							case 'name':
								currentTerm.name = trimmedText;
								break;
							case 'definition':
								currentTerm.definition = trimmedText;
								break;
						}
					} else if (isInActionItems && currentElement === 'item') {
						result.actionItems.push(trimmedText);
					} else {
						switch (currentElement) {
							case 'title':
								result.metadata.title = trimmedText;
								break;
							case 'duration':
								result.metadata.duration = trimmedText;
								break;
							case 'language':
								result.metadata.language = trimmedText;
								break;
						}
					}
				},

				onclosetag(name) {
					switch (name) {
						case 'brief_summary':
							isInBriefSummary = false;
							break;
						case 'detailed_summary':
							isInDetailedSummary = false;
							break;
						case 'section':
							if (currentSection.heading && currentSection.content && currentSection.timestamp) {
								result.detailedSummary.push(currentSection as Section);
							}
							break;
						case 'term':
							if (currentTerm.name && currentTerm.definition) {
								result.keyTerms.push(currentTerm as Term);
							}
							break;
						case 'key_terms':
							isInKeyTerms = false;
							break;
						case 'action_items':
							isInActionItems = false;
							break;
					}
					currentElement = '';
				},

				onerror(error) {
					reject(error);
				}
			},
			{ decodeEntities: true }
		);

		parser.write(xmlContent);
		parser.end();

		resolve(result);
	});
};
