import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import components from './components';
import PlainText from './PlainText';
import { MarkdownOptions, MarkdownOptionsProvider } from './MarkdownOptionsContext';
import { Box } from '@mui/material';
import { remarkVerifyIframe } from './embed/remarkVerifyIframe';
import { useConfig } from '@/domain/platform/config/useConfig';

const allowedNodeTypes = ['iframe'] as const;

export const MARKDOWN_CLASS_NAME = 'markdown'; // global styles applied

export interface WrapperMarkdownProps extends ReactMarkdownOptions, Partial<MarkdownOptions> {}

export const WrapperMarkdown = ({
  card = false,
  plain = false,
  multiline = !plain,
  disableParagraphPadding = card,
  caption = false,
  sx,
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
      <Box sx={{ li: { marginY: caption ? 0 : 1 }, display: plain ? 'inline' : undefined, ...sx }}>
        <ReactMarkdown
          // @ts-ignore
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
