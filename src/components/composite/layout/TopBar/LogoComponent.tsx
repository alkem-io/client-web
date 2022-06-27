import React from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoImage } from './alkemio-logo.svg';

const Logo = styled(LogoImage)(({ theme }) => ({
  height: theme.spacing(4),
}));

const LogoComponent = () => {
  return (
    <Link to="/">
      <Logo />
    </Link>
  );
};
export default LogoComponent;
