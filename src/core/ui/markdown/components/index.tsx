import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { CardText, Text } from '../../typography';
import MarkdownHeading from './MarkdownHeading';
import { gutters } from '../../grid/utils';

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

interface ParagraphProps
  extends Omit<ReactMarkdownProps, 'children'>,
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> {}

const Paragraph = ({ node, ref, ...props }: ParagraphProps) => {
  return <Text {...props} marginY={gutters(0.5)} />;
};

const CardParagraph = ({ node, ref, ...props }: ParagraphProps) => {
  return <CardText {...props} />;
};

const headings = {
  h1: MarkdownHeading,
  h2: MarkdownHeading,
  h3: MarkdownHeading,
  h4: MarkdownHeading,
  h5: MarkdownHeading,
  h6: MarkdownHeading,
} as const;

const common = {
  ...componentsInheritingWidth,
  ...headings,
  a: LinkNewTab,
} as const;

export const components = {
  ...common,
  p: Paragraph,
} as const;

export const componentsCard = {
  ...common,
  p: CardParagraph,
} as const;
