import { ComponentType } from 'react';
import { ButtonProps, useTheme } from '@mui/material';
import { useSelector } from '@xstate/react';
import { useLocation } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { useUserContext } from '../../../../domain/community/user';
import { useGlobalState } from '../../../../core/state/useGlobalState';
import UserSegment from '../../userSegment/UserSegment';
import SignInIcon from './SignInIcon';

interface ProfileMenuItemProps {
  buttonComponent: ComponentType<ButtonProps>;
  signInButtonComponent: ComponentType<ButtonProps>;
}

/**
 * @deprecated as part of the old App bar
 * @param Button
 * @param SignInButton
 * @constructor
 */
const ProfileMenuItem = ({ buttonComponent: Button, signInButtonComponent: SignInButton }: ProfileMenuItemProps) => {
  const { user, verified, isAuthenticated, loadingMe } = useUserContext();
  const theme = useTheme();
  const { pathname } = useLocation();

  const {
    ui: { userSegmentService },
  } = useGlobalState();

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

  const renderUserProfileSegment = () => {
    if (loadingMe) {
      return (
        <Button>
          <Skeleton
            variant="circular"
            width={theme.spacing(3)}
            height={theme.spacing(3)}
            sx={{ marginTop: theme.spacing(0.5) }}
          />
          <Skeleton variant="text" sx={{ width: theme => theme.spacing(6), marginTop: theme.spacing(0.5) }} />
        </Button>
      );
    }
    if (!isAuthenticated) {
      return <SignInIcon buttonComponent={SignInButton} returnUrl={pathname} />;
    }
    return (
      <>
        {isUserSegmentVisible && user && (
          <UserSegment userMetadata={user} emailVerified={verified} buttonComponent={Button} />
        )}
      </>
    );
  };

  return renderUserProfileSegment();
};

export default ProfileMenuItem;
