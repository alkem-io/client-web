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

export const TopBarHeight = 12;

const Root = styled(AppBar)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.common.white,
}));

const SearchBarGroup = styled(Box)(({ theme }) => ({
  alignSelf: 'right',
  display: 'flex',
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
            <LogoComponent sx={{ flexGrow: 1 }} />

            <SearchBarGroup>
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
