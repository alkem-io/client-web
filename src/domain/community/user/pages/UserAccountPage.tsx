import React, { FC, useMemo } from 'react';
import { useAccountSpacesQuery, useUserAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUserContext } from '../hooks/useUserContext';
import { AuthorizationPrivilege, CredentialType } from '../../../../core/apollo/generated/graphql-schema';
import { compact } from 'lodash';
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

  // TODO: This will not be needed when we have multiple spaces per account and a single account per user
  const accounts = data?.user?.accounts ?? [];
  const accountId = accounts[0]?.id;
  const accountHostName = data?.user.profile?.displayName;

  const { spaceIds, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaceIds: compact(accounts.flatMap(account => account.spaceID)),
      virtualContributors: accounts.flatMap(account => account.virtualContributors) ?? [],
      innovationPacks: accounts.flatMap(account => account.innovationPacks) ?? [],
      innovationHubs: accounts.flatMap(account => account.innovationHubs) ?? [],
    }),
    [accounts]
  );

  const { data: spacesData, loading: spacesLoading } = useAccountSpacesQuery({
    variables: {
      spacesIds: spaceIds,
    },
    skip: !spaceIds.length,
  });

  const isMyProfile = data?.user.id === currentUser?.user.id;
  const privileges = accounts[0]?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);
  const vcCampaignUser = data?.user?.agent.credentials
    ?.map(credential => credential.type)
    .includes(CredentialType.VcCampaign);

  const isSpaceLimitReached = spaceIds.length >= SPACE_COUNT_LIMIT;
  // currently creation is available only for accounts owned by the user
  const canCreateSpace =
    isMyProfile && privileges.includes(AuthorizationPrivilege.Create) && (!isSpaceLimitReached || isPlatformAdmin);

  // TODO: CREATE_INNOVATION_PACK & CREATE_INNOVATION_HUB privileges to be implemented and used
  // const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationPack =
    (isMyProfile && privileges.includes(AuthorizationPrivilege.Create)) || isPlatformAdmin;
  const canCreateInnovationHub = isPlatformAdmin;
  const isVCLimitReached = virtualContributors.length >= VIRTUAL_CONTRIBUTORS_LIMIT;
  // currently creation is available only for accounts owned by the user
  const canCreateVirtualContributor = isMyProfile && ((vcCampaignUser && !isVCLimitReached) || isPlatformAdmin);

  return (
    <UserSettingsLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountId={accountId}
        accountHostName={accountHostName}
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
