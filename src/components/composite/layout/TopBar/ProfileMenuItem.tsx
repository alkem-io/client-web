import { Theme } from '@mui/material';
import { useSelector } from '@xstate/react';
import Skeleton from '@mui/material/Skeleton';
import { useGlobalState, useUserContext } from '../../../../hooks';
import UserSegment from '../../entities/User/UserSegment';
import SignInSegment from '../../../../domain/session/SignInSegment';

const USER_SEGMENT_MAX_WIDTH = (theme: Theme) => theme.spacing(33); // approx. 25 characters
const USER_SEGMENT_USER_NAME_PROPS = {
  sx: {
    display: { xs: 'none', md: 'flex' },
  },
};

const ProfileIcon = () => {
  const { user, verified, isAuthenticated, loadingMe } = useUserContext();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  const renderUserProfileSegment = () => {
    if (loadingMe) {
      return <Skeleton sx={{ flexBasis: theme => theme.spacing(19), flexShrink: 1 }} />;
    }
    if (!isAuthenticated) {
      return <SignInSegment />;
    }
    return (
      <>
        {isUserSegmentVisible && user && (
          <UserSegment
            flexShrink={1}
            minWidth={0}
            maxWidth={USER_SEGMENT_MAX_WIDTH}
            userMetadata={user}
            emailVerified={verified}
            userNameProps={USER_SEGMENT_USER_NAME_PROPS}
          />
        )}
      </>
    );
  };

  return renderUserProfileSegment();
};

export default ProfileIcon;
