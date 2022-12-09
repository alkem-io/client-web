import React, { FC } from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import emoji from 'remark-emoji';
import { Box, BoxProps } from '@mui/material';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { CardText, Text } from '../../../core/ui/typography';

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
  return <Text {...props} />;
};

const CardParagraph = ({ node, ref, ...props }: ParagraphProps) => {
  return <CardText {...props} />;
};

const componentImplementations = {
  ...componentsInheritingWidth,
  a: LinkNewTab,
  p: Paragraph,
};

const componentImplementationsCard = {
  ...componentsInheritingWidth,
  a: LinkNewTab,
  p: CardParagraph,
};

const allowedNodeTypes = ['iframe'] as const;

export interface MarkdownProps extends ReactMarkdownOptions {
  card?: boolean;
}

export const WrapperMarkdown: FC<MarkdownProps> = ({ card = false, ...props }) => {
  // wrap this here, so that we don't have to include the gfm all the time
  return (
    <ReactMarkdown
      components={card ? componentImplementationsCard : componentImplementations}
      remarkPlugins={[gfm, [emoji, { padSpaceAfter: false, emoticon: true }]]}
      rehypePlugins={[rehypeRaw, { passThrough: allowedNodeTypes }] as MarkdownProps['rehypePlugins']}
      {...props}
    />
  );
};

export default WrapperMarkdown;
