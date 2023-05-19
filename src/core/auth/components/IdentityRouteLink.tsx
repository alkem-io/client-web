import React from 'react';
import { Button, ButtonProps, Link } from '@mui/material';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { buildReturnUrlParam } from '../../../common/utils/urlBuilders';
import { useLocation } from 'react-router-dom';

const IdentityRouteLink = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  children,
  to,
  ...props
}: ButtonProps<D, P> & { to: string }) => {
  const config = useConfig();

  const rootUrl = config.authentication?.providers[0].config.issuer;

  const { pathname } = useLocation();

  return (
    <Button component={Link} href={`${rootUrl}${to}${buildReturnUrlParam(pathname)}`} {...props}>
      {children}
    </Button>
  );
};

export default IdentityRouteLink;
