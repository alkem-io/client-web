import React, { FC } from 'react';
import { Loading } from '../../../common/components/core';
import { useUpdateNavigation, useUrlParams } from '../../../hooks';
import { PageProps, Error404 } from '../../../pages';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';
import UserProfilePageView, { UserProfileViewPageProps } from '../views/UserProfilePageView';

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
      <PageBanner title={userMetadata.user.displayName} />
      <SectionSpacer />
      <UserProfilePageView entities={{ userMetadata, verified }} options={options} />
    </>
  );
};
export default UserProfilePage;
