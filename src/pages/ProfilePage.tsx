import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { useUserContext } from '../hooks';
import { buildUserProfileUrl } from '../utils/urlBuilders';

interface ProfilePageProps {}

export const ProfilePage: FC<ProfilePageProps> = () => {
  const { user } = useUserContext();

  if (user) return <Redirect to={buildUserProfileUrl(user?.user.nameID)} />;
  return <Redirect to={'/'} />;
};
export default ProfilePage;
