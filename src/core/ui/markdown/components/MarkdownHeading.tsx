import { Typography, TypographyVariant } from '@mui/material';
import type { Element } from 'hast';

interface HeadingProps {
  node?: Element;
}

const MarkdownHeading = ({ node, ...props }: HeadingProps) => {
  return <Typography variant={(node?.tagName ?? 'h1') as TypographyVariant} {...props} />;
};

export default MarkdownHeading;
