import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import RouterLink from '../../link/RouterLink';

const MarkdownLink = ({
  node,
  href,
  ...props
}: ReactMarkdownProps &
  Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'ref'>) => {
  return <RouterLink to={node.properties?.href as string} underline="always" {...props} />;
};

export default MarkdownLink;
