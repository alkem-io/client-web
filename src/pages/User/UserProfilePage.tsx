import React, { FC } from 'react';
import { Error404 } from '../';
import { Loading } from '../../components/core';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUpdateNavigation, useUrlParams, useUserContext, useUserMetadata } from '../../hooks';
import UserProfilePageView, { UserProfileViewPageProps } from '../../views/User/UserProfilePageView';

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

  const options: UserProfileViewPageProps['options'] = {
    isCurrentUser: currentUser?.user.id === userMetadata.user.id || false,
  };

  return (
    <>
      <SectionSpacer />
      <UserProfilePageView entities={{ userMetadata, verified }} options={options} />
    </>
  );
};
export default UserProfilePage;
