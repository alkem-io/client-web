import 'react-chat-widget/lib/styles.css';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../../../core/ui/grid/utils';
import { SourcesHeadingTagHtml } from './formatChatGuidanceResponseAsMarkdown';
import { forwardRef } from 'react';

const ChatWidgetStyles = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box
    ref={ref}
    sx={theme => {
      const background = {
        backgroundColor: theme.palette.primary.main,
      };

      const borderRadius = {
        borderRadius: `${theme.shape.borderRadius}px`,
      };

      return {
        '.rcw-widget-container': {
          maxWidth: gutters(19),
        },
        '.rcw-launcher': background,
        '.rcw-conversation-container .rcw-header': {
          ...background,
          padding: theme.spacing(1),
          '.rcw-title': {
            padding: 0,
          },
        },
        '.rcw-conversation-container .rcw-close-button': {
          ...background,
          zIndex: 1, // Otherwise the custom header makes it unclickable
          top: theme.spacing(1.5),
          right: theme.spacing(0.5),
        },
        '.rcw-client .rcw-message-text': {
          ...background,
          color: theme.palette.background.paper,
        },
        '.rcw-response .rcw-message-text a': {
          color: theme.palette.text.primary,
        },
        [`.rcw-message-text ${SourcesHeadingTagHtml}`]: {
          ...theme.typography.body2,
          whiteSpace: 'normal',
          margin: 0,
          '+ ul': {
            ...theme.typography.body2,
            whiteSpace: 'normal',
            margin: 0,
            padding: 0,
            marginTop: gutters(-1),
            listStyleType: 'none',
            li: {
              margin: 0,
              padding: 0,
              ':before': {
                display: 'inline',
                content: '"• "',
              },
            },
          },
        },
        '.rcw-client, .rcw-response': {
          '.rcw-message-text, .rcw-snippet': {
            ...theme.typography.body1,
            ...borderRadius,
            maxWidth: 'none',
          },
        },
        '.rcw-sender': {
          alignItems: 'center',
          borderRadius: 0,
          '.rcw-send': {
            paddingTop: '4px',
          },
        },
        '.rcw-new-message': {
          ...theme.typography.body1,
          ...borderRadius,
          border: `1px solid ${theme.palette.divider}`,
          flexGrow: 1,
          flexShrink: 1,
          '.rcw-input': {
            lineHeight: `calc(${gutters()(theme)} - 2px)`,
          },
        },
        '.rcw-picker-btn': {
          display: 'none',
        },
        '.rcw-timestamp': {
          display: 'none',
        },
        '.rcw-conversation-container': {
          overflow: 'hidden',
        },
      };
    }}
    {...props}
  />
));

export default ChatWidgetStyles;
