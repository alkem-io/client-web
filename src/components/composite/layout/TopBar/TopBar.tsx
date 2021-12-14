import { AppBar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from '@xstate/react';
import React, { forwardRef } from 'react';
import { useGlobalState } from '../../../../hooks';
import SearchBar, { SearchBarSpacer } from './SearchBar';
import TopNavbar, { TopNavbarSpacer } from './TopNavbar';

const PREFIX = 'TopBar';

const classes = {
  bar: `${PREFIX}-bar`,
};

const Root = styled(AppBar)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.common.white,
  boxShadow: 'unset',
}));

const TopBar = forwardRef<HTMLDivElement>((_, ref) => {
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
    <Root ref={ref} position="fixed" className={classes.bar}>
      <SearchBar />
      <TopNavbar />
    </Root>
  );
});

export const TopBarSpacer = () => {
  return (
    <>
      <SearchBarSpacer />
      <TopNavbarSpacer />
    </>
  );
};

export default TopBar;
