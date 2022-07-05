import { Box, Container, Theme } from '@mui/material';
import { useSelector } from '@xstate/react';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useGlobalState, useUserContext } from '../../../../hooks';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';
import UserSegment from '../../entities/User/UserSegment';
import LogoComponent from './LogoComponent';
import TopSearchComponent from './TopSearchComponent';
import LanguageSelect from '../../../LanguageSelect/LanguageSelect';
import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SignInSegment from '../../../../domain/session/SignInSegment';

const USER_SEGMENT_MAX_WIDTH = (theme: Theme) => theme.spacing(33); // approx. 25 characters
const USER_SEGMENT_USER_NAME_PROPS = {
  sx: {
    display: { xs: 'none', md: 'flex' },
  },
};

const SearchBar = () => {
  const { user, verified, isAuthenticated, essentialsLoaded } = useUserContext();
  const breakpoint = useCurrentBreakpoint();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  const renderUserProfileSegment = () => {
    if (!essentialsLoaded) {
      return <Skeleton sx={{ flexBasis: theme => theme.spacing(19), flexShrink: 1 }} />;
    }
    if (!isAuthenticated) {
      return <SignInSegment />;
    }
    return (
      isUserSegmentVisible &&
      user && (
        <UserSegment
          flexShrink={1}
          minWidth={0}
          maxWidth={USER_SEGMENT_MAX_WIDTH}
          userMetadata={user}
          emailVerified={verified}
          userNameProps={USER_SEGMENT_USER_NAME_PROPS}
        />
      )
    );
  };

  return (
    <Container maxWidth={breakpoint}>
      <Box paddingY={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <LogoComponent />
        <Box
          flexGrow={1}
          justifyContent="center"
          sx={{
            maxWidth: theme => theme.spacing(64),
            display: {
              xs: 'none',
              md: 'block',
            },
          }}
        >
          <TopSearchComponent />
        </Box>
        <LanguageSelect sx={{ flexShrink: 0 }} />
        <Link to="/help">
          <HelpOutlineIcon color="primary" />
        </Link>
        {renderUserProfileSegment()}
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
