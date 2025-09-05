import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import components from './components';
import PlainText from './PlainText';
import { MarkdownOptions, MarkdownOptionsProvider } from './MarkdownOptionsContext';
import { Box, BoxProps } from '@mui/material';
import { remarkVerifyIframe } from './embed/remarkVerifyIframe';
import { useConfig } from '@/domain/platform/config/useConfig';

const allowedNodeTypes = ['iframe'] as const;

const MARKDOWN_CLASS_NAME = 'markdown'; // global styles applied

export interface WrapperMarkdownProps extends ReactMarkdownOptions, Partial<MarkdownOptions> {
  // Do not remove. Even if it's not used directly, React adds a className
  // when using sx, that gets passed to ReactMarkdown and it throws an error
  // because it doesn't support it anymore
  className?: string;
  containerProps?: BoxProps;
}

export const WrapperMarkdown = ({
  card = false,
  plain = false,
  multiline = !plain,
  disableParagraphPadding = card,
  caption = false,
  sx,
  className,
  containerProps,
  ...props
}: WrapperMarkdownProps) => {
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();

  return (
    <MarkdownOptionsProvider
      card={card}
      plain={plain}
      multiline={multiline}
      disableParagraphPadding={disableParagraphPadding}
      caption={caption}
    >
      <Box
        sx={{ li: { marginY: caption ? 0 : 1 }, display: plain ? 'inline' : undefined, ...sx }}
        className={`${MARKDOWN_CLASS_NAME} ${className || ''}`.trim()}
        {...containerProps}
      >
        <ReactMarkdown
          components={components}
          remarkPlugins={[
            gfm,
            [PlainText, { enabled: plain }],
            [remarkVerifyIframe, { allowedIFrameOrigins: iframeAllowedUrls }],
          ]}
          rehypePlugins={plain ? undefined : [[rehypeRaw, { passThrough: allowedNodeTypes }]]}
          {...props}
        />
      </Box>
    </MarkdownOptionsProvider>
  );
};

export default WrapperMarkdown;
