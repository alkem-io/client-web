import React, { FC } from 'react';
import Loading from '../../../../core/ui/loading/Loading';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';
import UserPageLayout from '../layout/UserPageLayout';
import UserProfilePageView from './UserProfilePageView';
import useUserContributions from '../userContributions/useUserContributions';
import useUserOrganizationIds from '../userContributions/useUserOrganizationIds';

interface UserProfileProps {
  edit?: boolean;
}

export const UserProfilePage: FC<UserProfileProps> = () => {
  const { verified } = useUserContext();

  const { userNameId = '' } = useUrlParams();

  const { user: userMetadata, loading } = useUserMetadata(userNameId);

  const contributions = useUserContributions(userNameId);

  const organizationIds = useUserOrganizationIds(userNameId);

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  if (!userMetadata) {
    return (
      <UserPageLayout>
        <Error404 />
      </UserPageLayout>
    );
  }

  return (
    <UserPageLayout>
      <UserProfilePageView
        contributions={contributions}
        organizationIds={organizationIds}
        entities={{ userMetadata, verified }}
      />
    </UserPageLayout>
  );
};

export default UserProfilePage;
