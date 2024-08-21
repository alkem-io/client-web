import React, { FC, useMemo } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import ContributorAccountView from '../components/Common/ContributorAccountView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useOrganizationAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
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

  const account = data?.organization?.account;

  const { spaces, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaces: account?.spaces ?? [],
      virtualContributors: account?.virtualContributors ?? [],
      innovationPacks: account?.innovationPacks ?? [],
      innovationHubs: account?.innovationHubs ?? [],
    }),
    [account]
  );

  const privileges = account?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);

  const isSpaceLimitReached = spaces.length >= SPACE_COUNT_LIMIT;
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
        accountId={account?.id}
        accountHostName={data?.organization.profile?.displayName ?? ''}
        spaces={spaces}
        virtualContributors={virtualContributors}
        innovationPacks={innovationPacks}
        innovationHubs={innovationHubs}
        loading={loading}
        canCreateSpace={canCreateSpace}
        canCreateVirtualContributor={canCreateVirtualContributor}
        canCreateInnovationPack={canCreateInnovationPack}
        canCreateInnovationHub={canCreateInnovationHub}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
