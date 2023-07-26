import { useEffect, useState } from 'react';
import { addResponseMessage, Widget } from 'react-chat-widget';
import { useAskChatGuidanceQuestionQuery } from '../../../core/apollo/generated/apollo-hooks';

const ChatWidget = () => {
  const [newMessage, setNewMessage] = useState(null);
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

  return <Widget handleNewUserMessage={handleNewUserMessage} />;
};

export default ChatWidget;
