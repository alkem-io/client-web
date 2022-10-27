import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkGithub from 'remark-github';
import emoji from 'remark-emoji';
import { Box, BoxProps } from '@mui/material';
import { unescapeEmojis } from '../composite/forms/tools/markdown-draft-js/emojis-handler';
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

export const WrapperMarkdown: FC<MarkdownProps> = ({ children, ...rest }: MarkdownProps) => {
  // wrap this here, so that we don't have to include the gfm all the time
  const content = unescapeEmojis(children);
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[
        gfm,
        [remarkGithub, { repository: 'https://github.com/alkem-io/alkemio.git' }],
        [emoji, { padSpaceAfter: false, emoticon: true }],
      ]}
      rehypePlugins={[rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins']}
      {...rest}
    >
      {content}
    </ReactMarkdown>
  );
};

export default WrapperMarkdown;
