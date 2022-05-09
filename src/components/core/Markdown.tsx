import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import { Box } from '@mui/material';

const Image: FC<{ node: any }> = ({ node, ...props }) => {
  return <Box component="img" maxWidth="100%" {...props} />;
};

const components = {
  img: Image,
};

export interface MarkdownProps extends ReactMarkdownOptions {}

export const Markdown: FC<MarkdownProps> = (props: MarkdownProps) => {
  // wrap this here, so that we don't have to include the gfm all the time
  return <ReactMarkdown components={components} remarkPlugins={[gfm]} {...props} />;
};

export default Markdown;
