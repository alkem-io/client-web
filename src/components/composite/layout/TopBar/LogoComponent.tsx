import React from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoImage } from './logo-preview.svg';

export interface LogoComponentProps extends BoxProps {
  url?: string;
}

const Logo = styled(LogoImage)(({ theme }) => ({
  height: theme.spacing(5),
}));

const LogoComponent = ({ url = '/', ...rest }: LogoComponentProps) => {
  return (
    <Box {...rest}>
      <Link to={url}>
        <Logo />
      </Link>
    </Box>
  );
};
export default LogoComponent;
