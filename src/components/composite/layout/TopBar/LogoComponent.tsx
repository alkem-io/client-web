import React from 'react';
import { styled } from '@mui/material';
import Link from '@mui/material/Link';
import { RouterLink } from '../../../core/RouterLink';
import { ReactComponent as LogoPreview } from './logo-preview.svg';

const PREFIX = 'LogoComponent';

const classes = {
  img: `${PREFIX}-img`,
};

const Root = styled('div')(({ theme }) => ({
  minWidth: 150,
  [`& .${classes.img}`]: {
    height: theme.spacing(5),
  },
}));

const LogoComponent = () => {
  return (
    <Root>
      <Link component={RouterLink} to="/">
        <LogoPreview className={classes.img} />
      </Link>
    </Root>
  );
};
export default LogoComponent;
