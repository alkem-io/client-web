import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from '@xstate/react';
import { styled } from '@mui/material/styles';
import { AppBar, Box, Button, Container, Grid, Toolbar, alpha } from '@mui/material';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import UserSegment from '../../entities/User/UserSegment';
import { useGlobalState, useUserContext } from '../../../../hooks';
import { RouterLink } from '../../../core/RouterLink';
import SearchComponent from './SearchComponent';
import LogoComponent from './LogoComponent';

const PREFIX = 'TopNavigation';

const classes = {
  appBar: `${PREFIX}-appBar`,
};

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  [`& .${classes.appBar}`]: {
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    boxShadow: 'unset',
  },
}));

interface TopNavigationProps {}

const TopNavigation: FC<TopNavigationProps> = () => {
  const { t } = useTranslation();
  const { user, verified, isAuthenticated } = useUserContext();

  const {
    ui: { loginNavigationService, userSegmentService },
  } = useGlobalState();

  const loginVisible = useSelector(loginNavigationService, state => {
    return state.matches('visible');
  });

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  if (!loginVisible) {
    return null;
  }

  return (
    <Root>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Container maxWidth="xl">
            <Box paddingY={2}>
              <Grid container display="flex" justifyContent="space-between" alignItems="center">
                <Grid item xs={3}>
                  <LogoComponent />
                </Grid>
                <Grid item xs>
                  <SearchComponent />
                </Grid>
                <Grid container item xs={3} justifyContent="end">
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
        </Toolbar>
      </AppBar>
    </Root>
  );
};
export default TopNavigation;
