import type { Element } from 'hast';
import Typography, { type TypographyVariant } from '@/core/ui/typography/Typography';

interface HeadingProps {
  node?: Element;
}

const MarkdownHeading = ({ node, ...props }: HeadingProps) => {
  return <Typography variant={(node?.tagName ?? 'h1') as TypographyVariant} {...props} />;
};

export default MarkdownHeading;
