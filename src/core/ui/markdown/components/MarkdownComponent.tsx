import type { SxProps } from '@mui/material';
import type { Element } from 'hast';
import type { ComponentProps, ElementType } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import { Caption, CardText, Text } from '@/core/ui/typography';
import { useMarkdownOptions } from '../MarkdownOptionsContext';

interface MarkdownComponentProps extends ComponentProps<'div'> {
  overrideDisableParagraphPadding?: boolean;
  sx?: SxProps;
  node?: Element;
  // Add index signature to handle ExtraProps from react-markdown
  [key: string]: unknown;
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
