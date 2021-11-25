import React from 'react';
import { Link } from 'react-router-dom';
import { RouterLink } from '../../../core/RouterLink';
import { ReactComponent as LogoPreview } from './logo-preview.svg';
import { styled } from '@mui/material';

const PREFIX = 'LogoComponent';

const classes = {
  img: `${PREFIX}-img`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.img}`]: {
    height: theme.spacing(5),
    [theme.breakpoints.down('xl')]: {
      height: theme.spacing(4),
    },
    [theme.breakpoints.down('md')]: {
      height: theme.spacing(2),
    },
  },
}));

const LogoComponent = () => {
  return (
    <Root>
      <Link component={RouterLink} to="//">
        <LogoPreview className={classes.img} />
      </Link>
    </Root>
  );
};
export default LogoComponent;
