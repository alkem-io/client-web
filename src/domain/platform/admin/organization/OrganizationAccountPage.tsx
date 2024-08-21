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

  // TODO: move to server logic
  const canCreateSpace =
    privileges.includes(AuthorizationPrivilege.CreateSpace) && (!isSpaceLimitReached || isPlatformAdmin);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const canCreateVirtualContributor = privileges.includes(AuthorizationPrivilege.CreateVirtualContributor);

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
