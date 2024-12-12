import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import components from './components';
import PlainText from './PlainText';
import { MarkdownOptions, MarkdownOptionsProvider } from './MarkdownOptionsContext';
import { Box } from '@mui/material';
import { remarkVerifyIframe } from './embed/remarkVerifyIframe';

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions, Partial<MarkdownOptions> {}

export const WrapperMarkdown = ({
  card = false,
  plain = false,
  multiline = !plain,
  disableParagraphPadding = card,
  caption = false,
  ...props
}: MarkdownProps) => (
  <MarkdownOptionsProvider
    card={card}
    plain={plain}
    multiline={multiline}
    disableParagraphPadding={disableParagraphPadding}
    caption={caption}
  >
    <Box sx={{ li: { marginY: caption ? 0 : 1 }, display: plain ? 'inline' : undefined }}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[gfm, [PlainText, { enabled: plain }], remarkVerifyIframe]}
        rehypePlugins={
          plain ? undefined : ([rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins'])
        }
        {...props}
      />
    </Box>
  </MarkdownOptionsProvider>
);

export default WrapperMarkdown;
