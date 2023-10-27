import React, { forwardRef } from 'react';
import { useSelector } from '@xstate/react';
import { AppBar, Box, Container, Theme } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useGlobalState } from '../../../../core/state/useGlobalState';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import HideOnScroll from '../HideOnScroll';
import { AlkemioLogoComponent } from './LogoComponent';
import SearchBar from './SearchBar';
import TopNavIcons from './TopNavIcons';
import MobileTopBar, { MobileTopBarHeightGutters } from './MobileTopBar';
import { gutters } from '../../../../core/ui/grid/utils';

const PREFIX = 'TopBar';

const classes = {
  bar: `${PREFIX}-bar`,
};

export const TopBarHeightGutters = 4;

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

/**
 * @deprecated
 * @constructor
 */
const TopBar = forwardRef<HTMLDivElement>((_, _ref) => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  const breakpoint = useCurrentBreakpoint();

  const loginVisible = useSelector(loginNavigationService, state => {
    return state.matches('visible');
  });

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  if (!loginVisible) {
    return null;
  }

  return (
    <HideOnScroll>
      <Root position="fixed" className={classes.bar}>
        {isMobile ? (
          <MobileTopBar />
        ) : (
          <Container maxWidth={breakpoint}>
            <DesktopTopBar />
          </Container>
        )}
      </Root>
    </HideOnScroll>
  );
});

/**
 * @deprecated
 * @constructor
 */
export const TopBarSpacer = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const height = gutters(isMobile ? MobileTopBarHeightGutters : TopBarHeightGutters)(theme);

  return <Box height={height} sx={{ visibility: 'hidden' }} />;
};

export default TopBar;

const DesktopTopBar = () => {
  return (
    <Box
      height={gutters(TopBarHeightGutters)}
      display="flex"
      gap={gutters()}
      alignItems="center"
      justifyContent="space-between"
    >
      <AlkemioLogoComponent height={gutters(2.5)} />
      <SearchBarGroup
        sx={{
          display: { xs: 'none', md: 'flex' },
          marginRight: { xs: 0, lg: theme => theme.spacing(2), xl: theme => theme.spacing(5) },
        }}
      >
        <SearchBar
          sx={theme => ({
            display: {
              xs: 'none',
              md: 'block',
            },
            width: {
              md: theme.spacing(15),
              lg: theme.spacing(35),
              xl: theme.spacing(42),
            },
          })}
        />
      </SearchBarGroup>

      <TopNavIcons />
    </Box>
  );
};
