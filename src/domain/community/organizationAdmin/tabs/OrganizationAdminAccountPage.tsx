import { useAccountInformationQuery, useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import ContributorAccountView from '@/domain/community/contributor/Account/ContributorAccountView';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { FC } from 'react';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';

const OrganizationAccountPage: FC<SettingsPageProps> = () => {
  const { organizationId } = useUrlResolver();
  const { data: organizationData, loading: loadingOrganization } = useOrganizationAccountQuery({
    variables: {
      organizationId: organizationId!,
    },
    skip: !organizationId,
  });

  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: {
      accountId: organizationData?.lookup.organization?.account?.id!,
    },
    skip: !organizationData?.lookup.organization?.account?.id,
  });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountHostName={organizationData?.lookup.organization?.profile?.displayName ?? ''}
        account={accountData?.lookup.account}
        loading={loadingOrganization || loadingAccount}
      />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAccountPage;
