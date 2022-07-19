import { AppBar, Box, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { useSelector } from '@xstate/react';
import React, { forwardRef } from 'react';
import { useGlobalState } from '../../../../hooks';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';
import HideOnScroll from '../HideOnScroll';
import HelpIcon from './HelpIcon';
import LanguageSelect from './LanguageSelect';
import LogoComponent from './LogoComponent';
import SearchBar from './SearchBar';
import TopNavIcons from './TopNavIcons';

const PREFIX = 'TopBar';

const classes = {
  bar: `${PREFIX}-bar`,
};

export const TopBarHeight = 9;

const Root = styled(AppBar)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.common.white,
  boxShadow: '0px 1px 1px -1px rgb(0 0 0 / 20%), 0px 2px 5px 0px rgb(0 0 0 / 14%), 0px 1px 6px 0px rgb(0 0 0 / 12%)',
}));

const SearchBarGroup = styled(Box)(({ theme }) => ({
  alignSelf: 'right',
  '& > div': {
    marginRight: theme.spacing(1),
  },
}));

const TopBar = forwardRef<HTMLDivElement>((_, _ref) => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  const theme = useTheme();

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
          <Box
            height={theme.spacing(TopBarHeight)}
            display="flex"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <LogoComponent flexGrow={1} height={theme.spacing(5)} />

            <SearchBarGroup
              sx={{
                display: { xs: 'none', md: 'flex' },
                marginRight: { xs: 0, lg: theme.spacing(2), xl: theme.spacing(5) },
              }}
            >
              <SearchBar />
              <LanguageSelect />
              <HelpIcon />
            </SearchBarGroup>

            <TopNavIcons />
          </Box>
        </Container>
      </Root>
    </HideOnScroll>
  );
});

export const TopBarSpacer = () => {
  const theme = useTheme();

  return <Box height={theme.spacing(TopBarHeight)} sx={{ visibility: 'hidden' }}></Box>;
};

export default TopBar;
