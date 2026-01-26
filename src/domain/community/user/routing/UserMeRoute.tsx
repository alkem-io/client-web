import { Outlet } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { MeUserProvider } from './MeUserContext';

const UserMeRoute = () => {
  const { userModel, loadingMe } = useCurrentUserContext();

  if (loadingMe || !userModel) {
    return <Loading text="Loading User Profile ..." />;
  }

  return (
    <MeUserProvider userId={userModel.id}>
      <Outlet />
    </MeUserProvider>
  );
};

export default UserMeRoute;
