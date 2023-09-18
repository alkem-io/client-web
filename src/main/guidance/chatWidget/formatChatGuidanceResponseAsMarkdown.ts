import { TFunction } from 'react-i18next';

const regex = /metadata={'(\w+)': '([^']*)('})/g;

export const SOURCES_HEADING_TAG_HTML = 'h5';
const SOURCES_HEADING_TAG_MARKDOWN = '#####';

interface Source {
  title: string;
  uri: string;
}

const getSources = (responseDocumentSources: string): Source[] => {
  let match;
  const sources: Source[] = [];
  while ((match = regex.exec(responseDocumentSources)) !== null) {
    sources.push({
      // TODO match[1] always gives "source", putting the URL there for now
      // title: match[1],
      title: match[2],
      uri: match[2],
    });
  }
  return sources;
};

interface ChatGuidanceQuestionResponse {
  answer: string;
  sources: string;
}

const formatChatGuidanceResponseAsMarkdown = (question: ChatGuidanceQuestionResponse, t: TFunction) => {
  const sources = getSources(question.sources);
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
