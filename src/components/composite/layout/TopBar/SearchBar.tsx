import { Box, Button, Container, Hidden } from '@mui/material';
import { useSelector } from '@xstate/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from '@mui/material/Skeleton';
import { useGlobalState, useUserContext } from '../../../../hooks';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../../../models/constants';
import { RouterLink } from '../../../core/RouterLink';
import UserSegment from '../../entities/User/UserSegment';
import LogoComponent from './LogoComponent';
import TopSearchComponent from './TopSearchComponent';
import LanguageSelect from '../../../LanguageSelect/LanguageSelect';
import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const SearchBar = () => {
  const { t } = useTranslation();
  const { user, verified, isAuthenticated, loading } = useUserContext();
  const breakpoint = useCurrentBreakpoint();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  const userProfileComponent = useMemo(
    () => (
      <>
        {!isAuthenticated && (
          <Box>
            <Button
              aria-label="Sign up"
              component={RouterLink}
              to={AUTH_REGISTER_PATH}
              sx={{
                padding: theme => theme.spacing(0.5, 1),
              }}
              variant="text"
              size="small"
            >
              {t('authentication.sign-up')}
            </Button>
            <Button
              aria-label="Sign in"
              component={RouterLink}
              to={AUTH_LOGIN_PATH}
              sx={{
                padding: theme => theme.spacing(0.5, 1),
              }}
              variant="text"
              size="small"
            >
              {t('authentication.sign-in')}
            </Button>
          </Box>
        )}
        {isUserSegmentVisible && user && <UserSegment userMetadata={user} emailVerified={verified} />}
      </>
    ),
    [isAuthenticated, isUserSegmentVisible, user, verified]
  );

  return (
    <Container maxWidth={breakpoint}>
      <Box paddingY={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <LogoComponent />
        <Hidden mdDown>
          <Box
            flexGrow={1}
            justifyContent="center"
            sx={{
              minWidth: 256,
              maxWidth: 512,
            }}
          >
            <TopSearchComponent />
          </Box>
        </Hidden>
        <LanguageSelect />
        <Link to="/help">
          <HelpOutlineIcon color="primary" />
        </Link>
        <Box width={155}>{loading ? <Skeleton /> : <>{userProfileComponent}</>}</Box>
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
