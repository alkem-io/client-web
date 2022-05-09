import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';

export interface ConditionalLinkProps {
  to?: string;
  condition: boolean;
  keepScroll?: boolean;
}

const ConditionalLink: FC<ConditionalLinkProps> = ({ children, to, condition, keepScroll = false }) =>
  condition && to ? (
    <Link component={RouterLink} to={to} underline="none" state={{ keepScroll }}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
export default ConditionalLink;
