import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';

export interface MarkdownProps extends ReactMarkdownOptions {}

export const Markdown: FC<MarkdownProps> = (props: MarkdownProps) => {
  // wrap this here, so that we don't have to include the gfm all the time
  return <ReactMarkdown remarkPlugins={[gfm]} {...props} />;
};

export default Markdown;
