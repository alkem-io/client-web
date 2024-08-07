import React, { FC, useMemo } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import OrganizationAccountView from './views/OrganizationAccountView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useAccountSpacesQuery, useOrganizationAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { compact } from 'lodash';

const OrganizationAccountPage: FC<SettingsPageProps> = () => {
  const { organizationNameId = '' } = useUrlParams();
  const { data, loading } = useOrganizationAccountQuery({
    variables: {
      organizationNameId,
    },
    skip: !organizationNameId,
  });

  const { spaceIds, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaceIds: compact(data?.organization?.accounts.flatMap(account => account.spaceID)),
      virtualContributors: data?.organization?.accounts.flatMap(account => account.virtualContributors) ?? [],
      innovationPacks: data?.organization?.accounts.flatMap(account => account.innovationPacks) ?? [],
      innovationHubs: data?.organization?.accounts.flatMap(account => account.innovationHubs) ?? [],
    }),
    [data?.organization?.accounts]
  );

  const { data: spacesData, loading: spacesLoading } = useAccountSpacesQuery({
    variables: {
      spacesIds: spaceIds,
    },
    skip: !spaceIds.length,
  });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Account}>
      <OrganizationAccountView
        spaces={spacesData?.spaces ?? []}
        virtualContributors={virtualContributors}
        innovationPacks={innovationPacks}
        innovationHubs={innovationHubs}
        loading={loading}
        spacesLoading={spacesLoading}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
