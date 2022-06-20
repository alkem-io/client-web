import React, { FC } from 'react';
import { Error404, PageProps } from '../';
import { Loading } from '../../components/core';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUpdateNavigation, useUrlParams, useUserContext, useUserMetadata } from '../../hooks';
import UserProfilePageView, { UserProfileViewPageProps } from '../../views/User/UserProfilePageView';

interface UserProfileProps extends PageProps {
  edit?: boolean;
}

export const UserProfilePage: FC<UserProfileProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { user: currentUser, verified } = useUserContext();

  const { userNameId = '' } = useUrlParams();

  const { user: userMetadata, loading } = useUserMetadata(userNameId);

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
