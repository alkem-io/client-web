import { useEffect, useRef } from 'react';
import { formatTime, scrollToBottom } from '../../../../utils';
import { Box } from '@mui/material';

import { useMessages } from '../../../../context/MessagesContext';
import { useChatBehavior } from '../../../../context/ChatBehaviorContext';

import Loader from './components/Loader';
import Message from './components/Message';

interface MessagesProps {
  profileAvatar?: string;
}

function Messages({ profileAvatar }: MessagesProps) {
  const {
    state: { messages, badgeCount },
    markAllMessagesRead,
    setBadgeCount,
  } = useMessages();
  const {
    state: { messageLoader: typing, showChat },
  } = useChatBehavior();

  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom(messageRef.current);
  }, [messages]);

  useEffect(() => {
    if (showChat && badgeCount > 0) {
      markAllMessagesRead();
    }
  }, [showChat, badgeCount, markAllMessagesRead]);

  useEffect(() => {
    const unreadCount = messages.filter(message => message.unread).length;
    setBadgeCount(unreadCount);
  }, [messages]);

  return (
    <Box
      id="messages"
      ref={messageRef}
      sx={{
        bgcolor: 'common.white',
        height: '50vh',
        maxHeight: 410,
        overflowY: 'scroll',
        paddingTop: 1.25, // 10px (theme spacing)
        WebkitOverflowScrolling: 'touch',
        '@media (max-width:800px)': {
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
        },
      }}
    >
      {messages?.map((message, index) => (
        <Message key={`${index}-${formatTime(message.timestamp)}`} message={message} profileAvatar={profileAvatar} />
      ))}
      <Loader typing={typing} />
    </Box>
  );
}

export default Messages;
