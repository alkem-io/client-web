import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';

export interface ConditionalLinkProps {
  to?: string;
  condition: boolean;
}

const ConditionalLink: FC<ConditionalLinkProps> = ({ children, to, condition }) =>
  condition && to ? (
    <Link component={RouterLink} to={to} underline={'none'}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
export default ConditionalLink;
