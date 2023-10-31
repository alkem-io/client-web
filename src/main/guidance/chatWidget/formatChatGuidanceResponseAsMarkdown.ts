import { TFunction } from 'react-i18next';

export const SOURCES_HEADING_TAG_HTML = 'h5';
const SOURCES_HEADING_TAG_MARKDOWN = '#####';

interface Source {
  uri?: string;
  title?: string;
}

interface ChatGuidanceQuestionResponse {
  answer: string;
  sources?: Source[];
}

const formatChatGuidanceResponseAsMarkdown = (response: ChatGuidanceQuestionResponse, t: TFunction) => {
  const { answer, sources } = response;
  const sourcesMarkdown =
    !sources || sources.length === 0
      ? ''
      : `

${SOURCES_HEADING_TAG_MARKDOWN} ${t('common.sources')}:

${sources.map(source => {
  const title = source.title ?? source.uri;
  const uri = source.uri ?? '';

  return `- [${title}](${uri})`;  
}).join('\n')}
  `;

  return `${answer}${sourcesMarkdown}`;
};

export default formatChatGuidanceResponseAsMarkdown;
