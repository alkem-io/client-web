import React from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import components from './components';
import PlainText from './PlainText';
import { MarkdownOptions, MarkdownOptionsProvider } from './MarkdownOptionsContext';

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions, Partial<MarkdownOptions> {}

export const WrapperMarkdown = ({
  card = false,
  plain = false,
  multiline = !plain,
  disableParagraphPadding = card,
  caption = false,
  ...props
}: MarkdownProps) => {
  return (
    <MarkdownOptionsProvider
      card={card}
      plain={plain}
      multiline={multiline}
      disableParagraphPadding={disableParagraphPadding}
      caption={caption}
    >
      <ReactMarkdown
        components={components}
        remarkPlugins={[gfm, [PlainText, { enabled: plain }]]}
        rehypePlugins={
          plain ? undefined : ([rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins'])
        }
        {...props}
      />
    </MarkdownOptionsProvider>
  );
};

export default WrapperMarkdown;
