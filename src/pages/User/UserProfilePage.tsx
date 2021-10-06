import React, { FC } from 'react';
import { Loading } from '../../components/core';
import { useUpdateNavigation, useUrlParams, useUserContext, useUserMetadata } from '../../hooks';
import UserProfileView, { UserProfileViewProps } from '../../views/User/UserProfileView';
import { Error404 } from '../';

interface UserProfileProps {
  edit?: boolean;
}

const currentPaths = [];

export const UserProfilePage: FC<UserProfileProps> = () => {
  useUpdateNavigation({ currentPaths });

  const { user: currentUser, verified } = useUserContext();

  const { userId } = useUrlParams();

  const { user: userMetadata, loading } = useUserMetadata(userId);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  if (!userMetadata) return <Error404 />;

  const options: UserProfileViewProps['options'] = {
    isCurrentUser: currentUser?.user.id === userMetadata.user.id,
  };

  return <UserProfileView entities={{ userMetadata, verified }} options={options} />;
};
export default UserProfilePage;
