import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../hooks';
import { buildUserProfileUrl } from '../../common/utils/urlBuilders';

export const ProfileRoute: FC = () => {
  const { user, loading } = useUserContext();

  if (loading) {
    return <></>;
  }

  if (user) return <Navigate to={buildUserProfileUrl(user?.user.nameID)} replace />;
  return <Navigate to={'/'} />;
};
export default ProfileRoute;
