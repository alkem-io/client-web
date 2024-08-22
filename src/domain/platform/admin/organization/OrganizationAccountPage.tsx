import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import ContributorAccountView from '../components/Common/ContributorAccountView';
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
      <ContributorAccountView
        accountHostName={data?.organization.profile?.displayName ?? ''}
        account={data?.organization?.account}
        loading={loading}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
