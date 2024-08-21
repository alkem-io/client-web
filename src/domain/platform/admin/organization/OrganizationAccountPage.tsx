import React, { FC, useMemo } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import ContributorAccountView from '../components/Common/ContributorAccountView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useAccountSpacesQuery, useOrganizationAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { compact } from 'lodash';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { SPACE_COUNT_LIMIT } from '../../../community/user/pages/UserAccountPage';

const OrganizationAccountPage: FC<SettingsPageProps> = () => {
  const { organizationNameId = '' } = useUrlParams();
  const { data, loading } = useOrganizationAccountQuery({
    variables: {
      organizationNameId,
    },
    skip: !organizationNameId,
  });

  // TODO: This will not be needed when we have multiple spaces per account and a single account per user
  const accounts = data?.organization?.accounts ?? [];
  const accountId = accounts[0]?.id;
  const accountHostName = data?.organization.profile?.displayName;

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

  const privileges = accounts[0]?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);

  const isSpaceLimitReached = spaceIds.length >= SPACE_COUNT_LIMIT;
  // currently creation is available only for accounts owned by the user
  const canCreateSpace = privileges.includes(AuthorizationPrivilege.Create) && !isSpaceLimitReached;

  // TODO: CREATE_INNOVATION_PACK & CREATE_INNOVATION_HUB privileges to be implemented and used
  // const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.Create) || isPlatformAdmin;
  const canCreateInnovationHub = isPlatformAdmin;
  // currently creation is available only for accounts owned by the user
  const canCreateVirtualContributor = false;

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Account}>
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
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
