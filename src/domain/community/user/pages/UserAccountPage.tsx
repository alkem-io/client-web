import React, { FC } from 'react';
import { useUserAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ContributorAccountSettings from '../../../account/settings/ContributorAccountSettings';
import { useUserContext } from '../hooks/useUserContext';
import { CredentialType } from '../../../../core/apollo/generated/graphql-schema';

interface UserAccountPageProps {}

export const UserAccountPage: FC<UserAccountPageProps> = () => {
  const { userNameId = '' } = useUrlParams();
  const { user: currentUser, loading: loadingUserContext } = useUserContext();

  const { data, loading } = useUserAccountQuery({
    variables: {
      userId: userNameId,
    },
    skip: !userNameId,
  });
  const isMyProfile = data?.user.id === currentUser?.user.id;
  const isVcCampaignUser = data?.user?.agent.credentials
    ?.map(credential => credential.type)
    .includes(CredentialType.VcCampaign);

  return (
    <UserSettingsLayout currentTab={SettingsSection.Account}>
      <ContributorAccountSettings
        accountId={data?.user?.account?.id}
        accountHostName={data?.user.profile?.displayName ?? ''}
        isMyProfile={isMyProfile}
        isVcCampaignUser={isVcCampaignUser}
        loading={loading || loadingUserContext}
      />
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
