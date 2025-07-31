import { useEffect, useRef } from 'react';
import { scrollToBottom } from '../../../../utils';

import { format } from 'date-fns';
import { MessageTypes, Link, CustomCompMessage, MESSAGE_SENDER } from '../../../../context/types';

import { useMessages } from '../../../../context/MessagesContext';
import { useChatBehavior } from '../../../../context/ChatBehaviorContext';

import Loader from './components/Loader';
import { Box } from '@mui/material';

type Props = {
  profileAvatar?: string;
};

function Messages({ profileAvatar }: Props) {
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
    // @ts-ignore
    scrollToBottom(messageRef.current);
    if (showChat && badgeCount) markAllMessagesRead();
    else setBadgeCount(messages.filter(message => message.unread).length);
  }, [messages, badgeCount, showChat, markAllMessagesRead, setBadgeCount]);

  const getComponentToRender = (message: MessageTypes | Link | CustomCompMessage) => {
    const ComponentToRender = message.component;
    if (message.type === 'component') {
      return <ComponentToRender {...message.props} />;
    }
    return <ComponentToRender message={message} />;
  };

  const isClientMsg = sender => sender === MESSAGE_SENDER.CLIENT;

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
      {messages?.map((message, index) => {
        const client = isClientMsg(message.sender);
        return (
          <Box
            // was rcw-message (+ -client)
            key={`${index}-${format(message.timestamp, 'hh:mm')}`}
            sx={{
              display: 'flex',
              flexDirection: client ? 'row-reverse' : 'row',
              margin: 1.25, // 10px
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar (bot/messages only, not client) */}
            {profileAvatar && !client && message.showAvatar && (
              <Box
                component="img"
                src={profileAvatar}
                alt="profile"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  marginRight: client ? 0 : 1.25, // 10px
                  marginLeft: client ? 1.25 : 0, // for symmetry if needed
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Message bubble */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: client ? 'auto' : 0,
                alignItems: client ? 'flex-end' : 'flex-start',
                bgcolor: client
                  ? theme => theme.palette.primary.light || '#d2f1fa' // Replace with design token if needed
                  : theme => theme.palette.grey[200], // $grey-2
                color: 'inherit',
                borderRadius: 2.5, // 20px, tweak for bubble corners
                px: 2, // horizontal padding
                py: 1, // vertical padding
                maxWidth: { xs: '80%', sm: '60%' },
                boxShadow: 1,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                // Markdown extras (for child component output)
                '& p': { m: 0 },
                '& img': { width: '100%', objectFit: 'contain' },
              }}
            >
              {getComponentToRender(message)}

              {/* If timestamp belongs here (optional): */}
              {message.timestamp && (
                <Box
                  component="span"
                  sx={{
                    fontSize: 10,
                    marginTop: 0.625,
                    alignSelf: client ? 'flex-end' : 'flex-start',
                    opacity: 0.6,
                  }}
                >
                  {format(message.timestamp, 'hh:mm')}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
      <Loader typing={typing} />
    </Box>
  );
}

export default Messages;
