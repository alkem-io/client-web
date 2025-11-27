import React from 'react';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';

export interface LinkProps extends MuiLinkProps {
  component?: React.ElementType;
  to?: string;
}

export const Link: React.FC<LinkProps> = props => {
  return <MuiLink {...props} />;
};
