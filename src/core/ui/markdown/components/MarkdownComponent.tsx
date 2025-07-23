import { ElementType, ComponentProps } from 'react';
import { Caption, CardText, Text } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { useMarkdownOptions } from '../MarkdownOptionsContext';
import { SxProps } from '@mui/material';
import type { Element } from 'hast';

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
