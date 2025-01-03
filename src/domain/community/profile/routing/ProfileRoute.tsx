import { Navigate } from 'react-router-dom';
import { useUserContext } from '@/domain/community/user';
import { buildUserProfileUrl } from '@/main/routing/urlBuilders';

export const ProfileRoute = () => {
  const { user, loading } = useUserContext();

  if (loading) {
    return <></>;
  }

  if (user) return <Navigate to={buildUserProfileUrl(user?.user.nameID)} replace />;
  return <Navigate to={'/'} />;
};

export default ProfileRoute;
