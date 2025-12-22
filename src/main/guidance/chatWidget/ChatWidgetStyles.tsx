import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps } from '@mui/material';

export const SOURCES_HEADING_TAG_HTML = 'h5'; // In the server there's a '#####' markdown tag

const ChatWidgetStyles = ({
  ref,
  ...props
}: BoxProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => (
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
        height: '100%',
        width: '100%',
        '.rcw-client .rcw-message-text': {
          ...background,
          color: theme.palette.common.white,
        },
        '.rcw-response .rcw-message-text a': {
          color: theme.palette.text.primary,
        },
        [`.rcw-message-text ${SOURCES_HEADING_TAG_HTML}`]: {
          ...theme.typography.body2,
          whiteSpace: 'normal',
          fontWeight: 'bold',
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
      };
    }}
    {...props}
  />
);

export default ChatWidgetStyles;
