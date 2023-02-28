import React from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import emoji from 'remark-emoji';
import components from './components';
import PlainText from './PlainText';
import { MarkdownOptions, MarkdownOptionsProvider } from './MarkdownOptionsContext';

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions, Partial<MarkdownOptions> {}

export const WrapperMarkdown = ({ card = false, flat = false, multiline = !flat, ...props }: MarkdownProps) => {
  return (
    <MarkdownOptionsProvider card={card} flat={flat} multiline={multiline}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[gfm, [emoji, { padSpaceAfter: false, emoticon: true }], [PlainText, { enabled: flat }]]}
        rehypePlugins={
          flat ? undefined : ([rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins'])
        }
        {...props}
      />
    </MarkdownOptionsProvider>
  );
};

export default WrapperMarkdown;
