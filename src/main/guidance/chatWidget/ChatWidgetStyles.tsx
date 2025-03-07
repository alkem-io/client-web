import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps } from '@mui/material';
import { forwardRef } from 'react';
import 'react-chat-widget-react-18/lib/styles.css';

export const SOURCES_HEADING_TAG_HTML = 'h5'; // In the server there's a '#####' markdown tag

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
          maxHeight: '-webkit-fill-available',
        },
        '.rcw-conversation-container': {
          display: 'flex',
          flexDirection: 'column',
          marginBottom: gutters(0.5),
          overflow: 'hidden',
          minWidth: 0,
        },
        '@media screen and (orientation: landscape)': {
          '.rcw-widget-container': {
            position: 'static',
            margin: 0,
            '&:has(.active)': {
              maxHeight: `calc(100vh - ${gutters(2)(theme)})`,
            },
          },
        },
        '@media screen and (orientation: portrait)': {
          '.rcw-widget-container': {
            maxWidth: 'none',
            '&:not(:has(.active))': {
              position: 'static',
              margin: 0,
            },
          },
          '.rcw-conversation-container': {
            margin: gutters(),
            maxWidth: 'none',
          },
        },
        '.rcw-launcher': {
          ...background,
          position: 'static',
          margin: 0,
        },
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
          right: theme.spacing(1),
          display: 'block',
          border: 0,
          position: 'absolute',
          width: theme.spacing(3),
          paddingX: 0,
          cursor: 'pointer',
          background: 'transparent',
          '.rcw-close': {
            padding: 0.2,
            width: 20,
            height: 20,
          },
        },
        '.rcw-client .rcw-message-text': {
          ...background,
          color: theme.palette.background.paper,
        },
        '.rcw-response .rcw-message-text a': {
          color: theme.palette.text.primary,
        },
        [`.rcw-message-text ${SOURCES_HEADING_TAG_HTML}`]: {
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
      };
    }}
    {...props}
  />
));

export default ChatWidgetStyles;
