import { Box, Container, Hidden } from '@mui/material';
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

const SearchBar = () => {
  const { user, verified, isAuthenticated, loading } = useUserContext();
  const breakpoint = useCurrentBreakpoint();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  const renderUserProfileSegment = () => {
    if (loading) {
      return <Skeleton />;
    }
    if (!isAuthenticated) {
      return <SignInSegment />;
    }
    return isUserSegmentVisible && user && <UserSegment userMetadata={user} emailVerified={verified} />;
  };

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
        <Box width={155}>{renderUserProfileSegment()}</Box>
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
