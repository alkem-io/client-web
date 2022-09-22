import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkGithub from 'remark-github';
import emoji from 'remark-emoji';
import { Box, BoxProps } from '@mui/material';
const createComponentWithInheritedWidth = (tagName: BoxProps['component']) => {
  const ReactMDNodeImplementation: FC<{ node: any }> = ({ node, ...props }) => {
    return <Box component={tagName} maxWidth="100%" {...props} />;
  };

  return ReactMDNodeImplementation;
};

const nodeTypesToInheritParentWidth = ['img', 'iframe'] as const;

const components = nodeTypesToInheritParentWidth.reduce((prev, tagName) => {
  return {
    ...prev,
    [tagName]: createComponentWithInheritedWidth(tagName),
  };
}, {});

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions {}

export const WrapperMarkdown: FC<MarkdownProps> = (props: MarkdownProps) => {
  // wrap this here, so that we don't have to include the gfm all the time
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[
        gfm,
        [remarkGithub, { repository: 'https://github.com/alkem-io/alkemio.git' }],
        [emoji, { padSpaceAfter: false, emoticon: true }],
      ]}
      rehypePlugins={[rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins']}
      {...props}
    />
  );
};

export default WrapperMarkdown;
