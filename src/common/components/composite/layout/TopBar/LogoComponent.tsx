import React from 'react';
import { Box, BoxProps, styled, Link as MuiLink } from '@mui/material';
import { ReactComponent as LogoImage } from './logo-preview.svg';
import { env } from '../../../../../types/env';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { ROUTE_HOME } from '../../../../../domain/platform/routes/constants';
import { useInnovationHubQuery } from '../../../../../core/apollo/generated/apollo-hooks';

export interface LogoComponentProps extends BoxProps {
  url?: string;
}

const Logo = styled(props => <LogoImage {...props} />)(() => ({
  height: '100%',
}));

const DEFAULT_URL = env?.REACT_APP_ALKEMIO_DOMAIN ? env.REACT_APP_ALKEMIO_DOMAIN + ROUTE_HOME : ROUTE_HOME;

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

export const AlkemioLogoComponent = (props: BoxProps) => {
  const { data } = useInnovationHubQuery();
  const isInSpace = !!data?.platform.innovationHub;

  return (
    <Box {...props}>
      <MuiLink target={isInSpace ? '_blank' : undefined} href={DEFAULT_URL}>
        <Logo />
      </MuiLink>
    </Box>
  );
};
