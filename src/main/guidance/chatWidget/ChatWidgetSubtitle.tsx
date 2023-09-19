import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../core/ui/typography';

const ChatWidgetSubtitle = () => {
  const { t } = useTranslation();

  return <BlockTitle padding={1}>{t('chatbot.subtitle')}</BlockTitle>;
};

export default ChatWidgetSubtitle;
