import React from 'react';
import Box from '@mui/material/Box';
import markdownIt from 'markdown-it';
import markdownItSup from 'markdown-it-sup';
import markdownItSanitizer from 'markdown-it-sanitizer';
import markdownItClass from '@toycode/markdown-it-class';
import markdownItLinkAttributes from 'markdown-it-link-attributes';

import { Message as MessageType } from '../../../../../context/types';
import { MESSAGE_SENDER } from '@/main/guidance/chatWidget/controls/context';

type Props = {
  message: MessageType;
  profileAvatar?: string;
};

function Message({ message, profileAvatar }: Props) {
  const isClient = message.sender === MESSAGE_SENDER.CLIENT;
  const isResponse = message.sender === MESSAGE_SENDER.RESPONSE;
  const isSnippet = message.type === 'snippet';
  let renderedContent: React.ReactElement | null = null;

  if ('text' in message) {
    const sanitizedHTML = markdownIt({ breaks: true })
      .use(markdownItClass, { img: ['rcw-message-img'] })
      .use(markdownItSup)
      .use(markdownItSanitizer)
      .use(markdownItLinkAttributes, {
        attrs: { target: '_blank', rel: 'noopener' },
      })
      .render(message.text);
    renderedContent = (
      <Box
        className="rcw-message-text"
        sx={{
          p: 0,
          m: 0,
          '& p': { m: 0 },
          '& img': { width: '100%', objectFit: 'contain' },
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  } else if ('title' in message && 'link' in message) {
    // Link message
    renderedContent = (
      <Box className="rcw-message-text" sx={{ p: 0, m: 0, wordBreak: 'break-word' }}>
        <a href={message.link} target={message.target || '_blank'} rel="noopener noreferrer">
          {message.title}
        </a>
      </Box>
    );
  } else if ('props' in message) {
    const Component = message.component;
    renderedContent = <Component {...message.props} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isClient ? 'row-reverse' : 'row',
        margin: '10px',
        alignItems: 'flex-start',
        wordWrap: 'break-word',
        textAlign: 'left',
      }}
    >
      {message.showAvatar && profileAvatar && (
        <Box
          component="img"
          src={profileAvatar}
          alt="Profile Avatar"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '100%',
            marginRight: '10px',
          }}
        />
      )}
      <Box
        sx={theme => {
          return {
            borderRadius: isClient ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
            backgroundColor: isClient ? theme.palette.primary.main : '#f4f7f9',
            padding: '15px',
            textAlign: 'left',
            wordBreak: 'break-word',
            ...theme.typography.body1,
            fontSize: 14,
            fontWeight: 300,
            letterSpacing: '-0.2px',
            ...(isClient && {
              marginLeft: 'auto',
            }),
            ...(isResponse && {
              alignItems: 'flex-start',
            }),
            ...(isSnippet && {
              backgroundColor: theme.palette.primary.light,
              borderRadius: '10px',
              maxWidth: '215px',
              padding: '15px',
              textAlign: 'left',
            }),
          };
        }}
        className={isClient ? 'rcw-client' : 'rcw-response'}
      >
        {renderedContent}
      </Box>
    </Box>
  );
}

export default Message;
