import { useEffect, useState } from 'react';
import { addResponseMessage, Widget } from 'react-chat-widget';
import { useAskChatGuidanceQuestionQuery } from '../../../core/apollo/generated/apollo-hooks';

import logo from './favicon-16x16.png';
import { useTranslation } from 'react-i18next';

const ChatWidget = () => {
  const [newMessage, setNewMessage] = useState(null);
  const { t } = useTranslation();
  const { data, loading } = useAskChatGuidanceQuestionQuery({
    variables: { chatData: { question: newMessage ?? '' } },
    skip: !newMessage,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data && !loading) {
      addResponseMessage(data.askChatGuidanceQuestion.answer);
    }
  }, [data, loading]);

  const handleNewUserMessage = message => {
    setNewMessage(message);
  };

  return (
    <Widget
      profileAvatar={logo}
      title={t('chatbot.title')}
      subtitle={t('chatbot.subtitle')}
      handleNewUserMessage={handleNewUserMessage}
    />
  );
};

export default ChatWidget;
