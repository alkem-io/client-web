import React from 'react';
import { useSelector } from '@xstate/react';
import { AppBar, Grid, Toolbar } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useGlobalState } from '../../../../hooks';
import SearchBar from './SearchBar';
import TopNavbar from './TopNavbar';

const PREFIX = 'TopBar';

const classes = {
  bar: `${PREFIX}-bar`,
};

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  [`& .${classes.bar}`]: {
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    boxShadow: 'unset',

    '& > *': {
      padding: 0,
    },
  },
}));

const TopBar = () => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  const loginVisible = useSelector(loginNavigationService, state => {
    return state.matches('visible');
  });

  if (!loginVisible) {
    return null;
  }

  return (
    <Root>
      <AppBar position="fixed" className={classes.bar}>
        <Toolbar>
          <Grid container>
            <Grid item xs={12}>
              <SearchBar />
            </Grid>
            <Grid item xs={12}>
              <TopNavbar />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Root>
  );
};
export default TopBar;
