import { Box, Button, Container, Hidden } from '@mui/material';
import { useSelector } from '@xstate/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState, useUserContext } from '../../../../hooks';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import { RouterLink } from '../../../core/RouterLink';
import UserSegment from '../../entities/User/UserSegment';
import LogoComponent from './LogoComponent';
import TopSearchComponent from './TopSearchComponent';

const SearchBar = () => {
  const { t } = useTranslation();
  const { user, verified, isAuthenticated } = useUserContext();
  const breakpoint = useCurrentBreakpoint();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  return (
    <Container maxWidth={breakpoint}>
      <Box paddingY={2} display="flex" alignItems="center" justifyContent="space-between">
        <LogoComponent />
        <Hidden mdDown>
          <Box
            flexGrow={1}
            justifyContent="center"
            paddingX={2}
            sx={{
              minWidth: 256,
              maxWidth: 512,
            }}
          >
            <TopSearchComponent />
          </Box>
        </Hidden>
        {!isAuthenticated && (
          <Button
            aria-label="Login"
            component={RouterLink}
            to={AUTH_LOGIN_PATH}
            sx={{
              padding: theme => theme.spacing(0.5, 1),
            }}
            variant="text"
            size="small"
          >
            {t('authentication.login')}
          </Button>
        )}
        {isUserSegmentVisible && user && <UserSegment userMetadata={user} emailVerified={verified} />}
        {/* <Grid container alignItems="center">
          <Grid item xs={3}></Grid>
          <Grid container item xs={4} justifyContent="end"></Grid>
        </Grid> */}
      </Box>
    </Container>
  );
};

export const SearchBarSpacer = () => {
  return (
    <Box paddingY={2}>
      <LogoComponent />
    </Box>
  );
};

export default SearchBar;
