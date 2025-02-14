import { useAccountInformationQuery, useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import ContributorAccountView from '@/domain/community/contributor/Account/ContributorAccountView';

export const UserAdminAccountPage = () => {
  const { userId } = useUrlResolver();

  const { data: userData, loading: loadingUser } = useUserAccountQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: {
      accountId: userData?.lookup.user?.account?.id!,
    },
    skip: !userData?.lookup.user?.account?.id,
  });

  return (
    <UserAdminLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountHostName={userData?.lookup.user?.profile?.displayName ?? ''}
        account={accountData?.lookup.account}
        loading={loadingUser || loadingAccount}
      />
    </UserAdminLayout>
  );
};

export default UserAdminAccountPage;
