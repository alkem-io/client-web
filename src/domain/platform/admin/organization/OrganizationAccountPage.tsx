import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import ContributorAccountView from '@/domain/community/contributor/Account/ContributorAccountView';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useAccountInformationQuery, useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';

const OrganizationAccountPage: FC<SettingsPageProps> = () => {
  const { organizationNameId = '' } = useUrlParams();
  const { data: organizationData, loading: loadingOrganization } = useOrganizationAccountQuery({
    variables: {
      organizationNameId,
    },
    skip: !organizationNameId,
  });

  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: {
      accountId: organizationData?.organization.account?.id!,
    },
    skip: !organizationData?.organization.account?.id,
  });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountHostName={organizationData?.organization.profile?.displayName ?? ''}
        account={accountData?.lookup.account}
        loading={loadingOrganization || loadingAccount}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
