import React from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import { ReactComponent as LogoImage } from './logo-preview.svg';
import { ROUTE_HOME } from '../../../../../domain/platform/routes/constants';
import RouterLink from '../../../../../core/ui/link/RouterLink';

export interface LogoComponentProps extends BoxProps {
  url?: string;
}

const Logo = styled(LogoImage)(() => ({
  height: '100%',
}));

const DEFAULT_URL = `${process.env.REACT_APP_ALKEMIO_DOMAIN ?? ''}${ROUTE_HOME}`;

const LogoComponent = ({ url = DEFAULT_URL, ...rest }: LogoComponentProps) => {
  return (
    <Box {...rest}>
      <RouterLink to={url}>
        <Logo />
      </RouterLink>
    </Box>
  );
};

export default LogoComponent;
