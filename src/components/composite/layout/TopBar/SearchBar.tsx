import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from '@xstate/react';
import { Box, Button, Container, Grid } from '@mui/material';
import LogoComponent from './LogoComponent';
import SearchComponent from './SearchComponent';
import { RouterLink } from '../../../core/RouterLink';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import UserSegment from '../../entities/User/UserSegment';
import { useGlobalState, useUserContext } from '../../../../hooks';

const SearchBar = () => {
  const { t } = useTranslation();
  const { user, verified, isAuthenticated } = useUserContext();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  return (
    <Container maxWidth="xl">
      <Box paddingY={2}>
        <Grid container display="flex" justifyContent="space-between" alignItems="center">
          <Grid item xs={3}>
            <LogoComponent />
          </Grid>
          <Grid item xs>
            <SearchComponent />
          </Grid>
          <Grid container item xs={4} justifyContent="end">
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
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
export default SearchBar;
