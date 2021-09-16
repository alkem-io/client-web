import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/core';
import { useUpdateNavigation, useUserContext, useUserMetadata } from '../../hooks';
import UserProfileView, { UserProfileViewProps } from '../../views/User/UserProfileView';
import { FourOuFour } from '../FourOuFour';

interface UserProfileProps {
  edit?: boolean;
}

const currentPaths = [];

export const UserProfilePage: FC<UserProfileProps> = () => {
  useUpdateNavigation({ currentPaths });

  const { user: currentUser, verified } = useUserContext();

  const { userId } = useParams<{ userId: string }>();

  const { user: userMetadata, loading } = useUserMetadata(userId);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  if (!userMetadata) return <FourOuFour />;

  const options: UserProfileViewProps['options'] = {
    isCurrentUser: currentUser?.user.id === userMetadata.user.id,
  };

  return <UserProfileView entities={{ userMetadata, verified }} options={options} />;
};
export default UserProfilePage;
