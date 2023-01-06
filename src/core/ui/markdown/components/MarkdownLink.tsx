import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import RouterLink from '../../link/RouterLink';

const MarkdownLink = ({
  node,
  href,
  ...props
}: ReactMarkdownProps & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
  return <RouterLink to={node.properties?.href as string} underline="always" loose {...props} />;
};

export default MarkdownLink;
