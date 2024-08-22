import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import ContributorAccountSettings from '../../../account/settings/ContributorAccountSettings';
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

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Account}>
      <ContributorAccountSettings
        accountId={data?.organization?.account?.id}
        accountHostName={data?.organization.profile?.displayName ?? ''}
        loading={loading}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
