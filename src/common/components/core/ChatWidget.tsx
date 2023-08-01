import { useEffect, useState } from 'react';
import { addResponseMessage, Widget } from 'react-chat-widget';
import { useAskChatGuidanceQuestionQuery } from '../../../core/apollo/generated/apollo-hooks';

import logo from './favicon-16x16.png';
import { useTranslation } from 'react-i18next';
import { FEATURE_GUIDANCE_ENGINE } from '../../../domain/platform/config/features.constants';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { useUserContext } from '../../../domain/community/contributor/user';

const ChatWidget = () => {
  const [newMessage, setNewMessage] = useState(null);
  const { t } = useTranslation();
  const { data, loading } = useAskChatGuidanceQuestionQuery({
    variables: { chatData: { question: newMessage ?? '' } },
    skip: !newMessage,
    fetchPolicy: 'cache-and-network',
  });

  const { isFeatureEnabled } = useConfig();
  const guidanceEnabled: boolean = isFeatureEnabled(FEATURE_GUIDANCE_ENGINE);
  const { user: currentUser } = useUserContext();
  const enableWidget = currentUser?.permissions.canAccessInteractiveGuidance && guidanceEnabled;
  useEffect(() => {
    if (data && !loading) {
      addResponseMessage(data.askChatGuidanceQuestion.answer);
    }
  }, [data, loading]);

  const handleNewUserMessage = message => {
    setNewMessage(message);
  };

  return enableWidget ? (
    <Widget
      profileAvatar={logo}
      title={t('chatbot.title')}
      subtitle={t('chatbot.subtitle')}
      handleNewUserMessage={handleNewUserMessage}
    />
  ) : null;
};

export default ChatWidget;
