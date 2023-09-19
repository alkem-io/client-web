import { TFunction } from 'react-i18next';

export const SOURCES_HEADING_TAG_HTML = 'h5';
const SOURCES_HEADING_TAG_MARKDOWN = '#####';

interface Source {
  title: string;
  uri: string;
}

interface ChatGuidanceQuestionResponse {
  answer: string;
  sources: Source[];
}

const formatChatGuidanceResponseAsMarkdown = (question: ChatGuidanceQuestionResponse, t: TFunction) => {
  const sources = question.sources;
  const sourcesMarkdown =
    sources.length === 0
      ? ''
      : `

${SOURCES_HEADING_TAG_MARKDOWN} ${t('common.sources')}:

${sources.map(source => `- [${source.title}](${source.uri})`).join('\n')}
  `;

  return `${question.answer}${sourcesMarkdown}`;
};

export default formatChatGuidanceResponseAsMarkdown;
