import React, { FC, useMemo } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import OrganizationAccountView from './views/OrganizationAccountView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useOrganizationAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';

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

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Account}>
      <OrganizationAccountView
        spaces={spaces}
        virtualContributors={virtualContributors}
        innovationPacks={innovationPacks}
        innovationHubs={innovationHubs}
        loading={loading}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
