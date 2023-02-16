import React from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoImage } from './logo-preview.svg';
import { ROUTE_HOME } from '../../../../../domain/platform/routes/routes';

export interface LogoComponentProps extends BoxProps {
  url?: string;
}

const Logo = styled(LogoImage)(() => ({
  height: '100%',
}));

const LogoComponent = ({ url = ROUTE_HOME, ...rest }: LogoComponentProps) => {
  return (
    <Box {...rest}>
      <Link to={url}>
        <Logo />
      </Link>
    </Box>
  );
};

export default LogoComponent;
