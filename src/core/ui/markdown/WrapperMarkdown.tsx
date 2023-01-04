import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import emoji from 'remark-emoji';
import { components, componentsCard } from './components';

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions {
  card?: boolean;
}

export const WrapperMarkdown: FC<MarkdownProps> = ({ card = false, ...props }) => {
  return (
    <ReactMarkdown
      components={card ? componentsCard : components}
      remarkPlugins={[gfm, [emoji, { padSpaceAfter: false, emoticon: true }]]}
      rehypePlugins={[rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins']}
      {...props}
    />
  );
};

export default WrapperMarkdown;
