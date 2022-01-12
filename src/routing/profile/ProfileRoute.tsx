import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../hooks';
import { buildUserProfileUrl } from '../../utils/urlBuilders';

export const ProfileRoute: FC = () => {
  const { user } = useUserContext();

  if (user) return <Navigate to={buildUserProfileUrl(user?.user.nameID)} />;
  return <Navigate to={'/'} />;
};
export default ProfileRoute;
