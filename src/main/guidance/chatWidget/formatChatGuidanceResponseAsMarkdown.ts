import { TFunction } from 'react-i18next';

export const SOURCES_HEADING_TAG_HTML = 'h5';
const SOURCES_HEADING_TAG_MARKDOWN = '#####';

interface Source {
  uri?: string;
}

interface ChatGuidanceQuestionResponse {
  answer: string;
  sources?: Source[];
}

const formatChatGuidanceResponseAsMarkdown = (question: ChatGuidanceQuestionResponse, t: TFunction) => {
  const { answer, sources } = question;
  const sourcesMarkdown =
    !sources || sources.length === 0
      ? ''
      : `

${SOURCES_HEADING_TAG_MARKDOWN} ${t('common.sources')}:

${sources
  .filter(source => source.uri)
  .map(source => `- [${source.uri}](${source.uri})`)
  .join('\n')}
  `;

  return `${answer}${sourcesMarkdown}`;
};

export default formatChatGuidanceResponseAsMarkdown;
