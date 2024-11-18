import { PropsWithChildren } from 'react';
import { Link } from '@mui/material';
import RouterLink from './RouterLink';

export interface ConditionalLinkProps {
  to?: string;
  condition?: boolean;
  keepScroll?: boolean;
}

const ConditionalLink = ({
  children,
  to,
  condition = false,
  keepScroll = false,
}: PropsWithChildren<ConditionalLinkProps>) =>
  condition && to ? (
    <Link component={RouterLink} to={to} underline="none" state={{ keepScroll }}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
export default ConditionalLink;
