import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { CardText, Text } from '../../typography';
import { gutters } from '../../grid/utils';
import { useMarkdownOptions } from '../MarkdownOptionsContext';

const MarkdownParagraph = ({ node, ...props }: ReactMarkdownProps) => {
  const { card, multiline } = useMarkdownOptions();

  const Component = card ? CardText : Text;

  return <Component noWrap={!multiline} marginY={card ? 0 : gutters(0.5)} {...props} />;
};

export default MarkdownParagraph;
