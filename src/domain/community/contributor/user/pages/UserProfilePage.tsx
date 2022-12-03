import React, { FC } from 'react';
import { Loading } from '../../../../../common/components/core';
import { useUpdateNavigation, useUrlParams } from '../../../../../hooks';
import { PageProps } from '../../../../shared/types/PageProps';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';
import UserPageLayout from '../layout/UserPageLayout';
import UserProfilePageView from '../views/UserProfilePageView';

interface UserProfileProps extends PageProps {
  edit?: boolean;
}

export const UserProfilePage: FC<UserProfileProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { verified } = useUserContext();

  const { userNameId = '' } = useUrlParams();

  const { user: userMetadata, loading } = useUserMetadata(userNameId);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  if (!userMetadata) return <Error404 />;

  return (
    <UserPageLayout currentSection={EntityPageSection.Profile}>
      <UserProfilePageView entities={{ userMetadata, verified }} />
    </UserPageLayout>
  );
};
export default UserProfilePage;
