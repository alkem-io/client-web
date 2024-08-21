import React, { FC, useMemo } from 'react';
import { useAccountSpacesQuery, useUserAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUserContext } from '../hooks/useUserContext';
import { AuthorizationPrivilege, CredentialType } from '../../../../core/apollo/generated/graphql-schema';
import { VIRTUAL_CONTRIBUTORS_LIMIT } from '../../../../main/topLevelPages/myDashboard/myAccount/MyAccountBlockVCCampaignUser';
import ContributorAccountView from '../../../platform/admin/components/Common/ContributorAccountView';

export const SPACE_COUNT_LIMIT = 3;

interface UserAccountPageProps {}

export const UserAccountPage: FC<UserAccountPageProps> = () => {
  const { userNameId = '' } = useUrlParams();
  const { user: currentUser } = useUserContext();

  const { data, loading } = useUserAccountQuery({
    variables: {
      userId: userNameId,
    },
    skip: !userNameId,
  });

  const account = data?.user?.account;

  const { spaces, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaces: data?.user?.account?.spaces ?? [],
      virtualContributors: data?.user?.account?.virtualContributors ?? [],
      innovationPacks: data?.user?.account?.innovationPacks ?? [],
      innovationHubs: data?.user?.account?.innovationHubs ?? [],
    }),
    [data?.user?.account]
  );
  const spaceIds = spaces.map(space => space.id);

  const { data: spacesData, loading: spacesLoading } = useAccountSpacesQuery({
    variables: {
      spacesIds: spaceIds,
    },
    skip: !spaces.length,
  });

  const isMyProfile = data?.user.id === currentUser?.user.id;
  const privileges = account?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);
  const vcCampaignUser = data?.user?.agent.credentials
    ?.map(credential => credential.type)
    .includes(CredentialType.VcCampaign);

  const isSpaceLimitReached = spaceIds.length >= SPACE_COUNT_LIMIT;
  const canCreateSpace =
    privileges.includes(AuthorizationPrivilege.CreateSpace) && (!isSpaceLimitReached || isPlatformAdmin);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const isVCLimitReached = virtualContributors.length >= VIRTUAL_CONTRIBUTORS_LIMIT;
  // currently creation is available only for accounts owned by the user
  const canCreateVirtualContributor = isMyProfile && ((vcCampaignUser && !isVCLimitReached) || isPlatformAdmin);

  return (
    <UserSettingsLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountId={account?.id}
        accountHostName={data?.user.profile?.displayName ?? ''}
        spaces={spacesData?.spaces ?? []}
        virtualContributors={virtualContributors}
        innovationPacks={innovationPacks}
        innovationHubs={innovationHubs}
        loading={loading}
        spacesLoading={spacesLoading}
        canCreateSpace={canCreateSpace}
        canCreateVirtualContributor={canCreateVirtualContributor}
        canCreateInnovationPack={canCreateInnovationPack}
        canCreateInnovationHub={canCreateInnovationHub}
      />
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
