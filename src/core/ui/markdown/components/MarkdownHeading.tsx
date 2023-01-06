import { HeadingProps } from 'react-markdown/lib/ast-to-react';
import { Typography } from '@mui/material';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HTML_HEADING_LEVEL_MAX = 6;

const PLATFORM_HEADING_LEVEL_MAX = 4;

const MarkdownHeading = ({ level, node, ...props }: HeadingProps) => {
  const markdownHeadingLevel = level + PLATFORM_HEADING_LEVEL_MAX;

  if (markdownHeadingLevel <= HTML_HEADING_LEVEL_MAX) {
    const variant = `h${markdownHeadingLevel as HeadingLevel}` as const;
    return <Typography variant={variant} {...props} />;
  } else {
    return <div aria-role="heading" aria-level={markdownHeadingLevel} {...props} />;
  }
};

export default MarkdownHeading;
