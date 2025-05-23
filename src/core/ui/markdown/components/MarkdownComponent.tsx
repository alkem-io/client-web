import { ElementType, ReactNode } from 'react';
import { Caption, CardText, Text } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { useMarkdownOptions } from '../MarkdownOptionsContext';
import { SxProps } from '@mui/material';

interface MarkdownComponentProps {
  overrideDisableParagraphPadding?: boolean;
  sx?: SxProps;
  node?: ReactNode;
}

const createMarkdownComponent =
  (component: ElementType) =>
  ({ node, overrideDisableParagraphPadding, ...props }: MarkdownComponentProps) => {
    const { card, multiline, caption, disableParagraphPadding } = useMarkdownOptions();

    const Component = caption ? Caption : card ? CardText : Text;

    const disableMargin = overrideDisableParagraphPadding ?? disableParagraphPadding;

    return (
      <Component component={component} noWrap={!multiline} marginY={disableMargin ? 0 : gutters(0.5)} {...props} />
    );
  };

export default createMarkdownComponent;
