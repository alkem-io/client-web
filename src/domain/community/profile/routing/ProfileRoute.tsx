import { Navigate } from 'react-router-dom';
import { useUserContext } from '@/domain/community/user';

export const ProfileRoute = () => {
  const { user, loading } = useUserContext();

  if (loading) {
    return <></>;
  }

  if (user) return <Navigate to={user?.user.profile.url} replace />;
  return <Navigate to={'/'} />;
};

export default ProfileRoute;
