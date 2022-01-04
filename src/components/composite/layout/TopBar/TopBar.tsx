import { AppBar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from '@xstate/react';
import React, { forwardRef } from 'react';
import { useGlobalState } from '../../../../hooks';
import HideOnScroll from '../HideOnScroll';
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

const TopBar = forwardRef<HTMLDivElement>((_, _ref) => {
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
    <HideOnScroll>
      <Root position="fixed" className={classes.bar}>
        <SearchBar />
        <TopNavbar />
      </Root>
    </HideOnScroll>
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
