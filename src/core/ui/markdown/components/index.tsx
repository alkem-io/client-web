import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import MarkdownHeading from './MarkdownHeading';
import MarkdownParagraph from './MarkdownParagraph';

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

const headings = {
  h1: MarkdownHeading,
  h2: MarkdownHeading,
  h3: MarkdownHeading,
  h4: MarkdownHeading,
  h5: MarkdownHeading,
  h6: MarkdownHeading,
} as const;

const components = {
  ...componentsInheritingWidth,
  ...headings,
  a: LinkNewTab,
  p: MarkdownParagraph,
} as const;

export default components;
