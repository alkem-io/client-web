import { Outlet } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { MeUserProvider } from './MeUserContext';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';

const UserMeRoute = () => {
  const { userModel, loadingMe } = useCurrentUserContext();

  return (
    <NoIdentityRedirect>
      {loadingMe || !userModel ? (
        <Loading text="Loading User Profile ..." />
      ) : (
        <MeUserProvider userId={userModel.id}>
          <Outlet />
        </MeUserProvider>
      )}
    </NoIdentityRedirect>
  );
};

export default UserMeRoute;
