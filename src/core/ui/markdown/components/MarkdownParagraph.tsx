import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { CardText, Text } from '../../typography';
import { gutters } from '../../grid/utils';
import { useMarkdownOptions } from '../MarkdownOptionsContext';

interface MarkdownParagraphProps extends ReactMarkdownProps {
  overrideDisableParagraphPadding?: boolean;
}

const MarkdownParagraph = ({ node, overrideDisableParagraphPadding, ...props }: MarkdownParagraphProps) => {
  const { card, multiline, disableParagraphPadding } = useMarkdownOptions();

  const Component = card ? CardText : Text;

  const disableMargin = overrideDisableParagraphPadding ?? disableParagraphPadding;
  return <Component noWrap={!multiline} marginY={disableMargin ? 0 : gutters(0.5)} {...props} />;
};

export default MarkdownParagraph;
