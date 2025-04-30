import React from 'react';
import RouterLink from '@/core/ui/link/RouterLink';
import { SxProps } from '@mui/material';

interface ReactMarkdownProps {
  sx?: SxProps;
  node?: {
    properties?: {
      href?: string;
    };
  };
}

const MarkdownLink = ({
  node,
  href,
  ...props
}: ReactMarkdownProps &
  Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'ref'>) => (
  <RouterLink to={node?.properties?.href as string} underline="always" {...props} />
);

export default MarkdownLink;
