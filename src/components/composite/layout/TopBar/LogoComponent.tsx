import React from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoPreview } from './logo-preview.svg';

const Logo = styled(LogoPreview)(({ theme }) => ({
  height: theme.spacing(5),
}));

const LogoComponent = () => {
  return (
    <Link to="/">
      <Logo />
    </Link>
  );
};
export default LogoComponent;
