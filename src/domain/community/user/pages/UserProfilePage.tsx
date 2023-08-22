import React, { FC } from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';
import UserPageLayout from '../layout/UserPageLayout';
import UserProfilePageView from '../views/UserProfilePageView';

interface UserProfileProps {
  edit?: boolean;
}

export const UserProfilePage: FC<UserProfileProps> = () => {
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
