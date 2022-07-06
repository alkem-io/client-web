import { AppBar, Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from '@xstate/react';
import React, { forwardRef } from 'react';
import { useGlobalState } from '../../../../hooks';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';
import HideOnScroll from '../HideOnScroll';
import HelpIcon from './HelpIcon';
import LanguageSelect from './LanguageSelect';
import LogoComponent from './LogoComponent';
import ProfileIcon from './ProfileIcon';
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
  borderTop: '2px solid black',
}));

const TopBar = forwardRef<HTMLDivElement>((_, _ref) => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  const breakpoint = useCurrentBreakpoint();

  const loginVisible = useSelector(loginNavigationService, state => {
    return state.matches('visible');
  });

  if (!loginVisible) {
    return null;
  }

  return (
    <HideOnScroll>
      <Root position="fixed" className={classes.bar}>
        <Container maxWidth={breakpoint}>
          <Box paddingY={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
            <LogoComponent />
            <SearchBar />
            <LanguageSelect sx={{ flexShrink: 0 }} />
            <HelpIcon />
            <ProfileIcon />
          </Box>
        </Container>
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
