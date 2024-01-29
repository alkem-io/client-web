import React from 'react';
import { Button, ButtonProps, Link } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { buildLoginUrl } from '../../../main/routing/urlBuilders';

const IdentityRouteLink = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  children,
  to,
  ...props
}: ButtonProps<D, P> & { to: string }) => {
  const { pathname } = useLocation();

  return (
    <Button component={Link} href={buildLoginUrl(pathname)} {...props}>
      {children}
    </Button>
  );
};

export default IdentityRouteLink;
