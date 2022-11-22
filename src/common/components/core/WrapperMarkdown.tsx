import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import emoji from 'remark-emoji';
import { Box, BoxProps } from '@mui/material';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';

const createComponentThatInheritsParentWidth = (tagName: BoxProps['component']) => {
  const ReactMDNodeImplementation: FC<{ node: ReactMarkdownProps['node'] }> = ({ node, ...props }) => {
    return <Box component={tagName} maxWidth="100%" {...props} />;
  };

  return ReactMDNodeImplementation;
};

const nodeTypesInheritingParentWidth = ['img', 'iframe'] as const;

const componentsInheritingWidth = nodeTypesInheritingParentWidth.reduce((prev, tagName) => {
  return {
    ...prev,
    [tagName]: createComponentThatInheritsParentWidth(tagName),
  };
}, {});

interface LinkProps
  extends Omit<ReactMarkdownProps, 'children'>,
    React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {}

const LinkNewTab = ({ node, ...props }: LinkProps) => {
  return <a target="_blank" {...props} />;
};

const componentImplementations = {
  ...componentsInheritingWidth,
  a: LinkNewTab,
};

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions {}

export const WrapperMarkdown: FC<MarkdownProps> = (props: MarkdownProps) => {
  // wrap this here, so that we don't have to include the gfm all the time
  return (
    <ReactMarkdown
      components={componentImplementations}
      remarkPlugins={[
        gfm,
        [emoji, { padSpaceAfter: false, emoticon: true }],
      ]}
      rehypePlugins={[rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins']}
      {...props}
    />
  );
};

export default WrapperMarkdown;
