import React from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import LogoImage from '../../logo/logoPreview.svg?react';
import { env } from '../../../env';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { ROUTE_HOME } from '../../../../domain/platform/routes/constants';

export interface LogoComponentProps extends BoxProps {
  url?: string;
}

const Logo = styled(LogoImage)(() => ({
  height: '100%',
}));

const DEFAULT_URL = env?.VITE_APP_ALKEMIO_DOMAIN ? env.VITE_APP_ALKEMIO_DOMAIN + ROUTE_HOME : ROUTE_HOME;

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
