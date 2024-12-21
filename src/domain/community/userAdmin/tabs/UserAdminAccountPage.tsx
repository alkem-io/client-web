import { useAccountInformationQuery, useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { useUrlParams } from '@/core/routing/useUrlParams';
import ContributorAccountView from '@/domain/community/contributor/Account/ContributorAccountView';

export const UserAdminAccountPage = () => {
  const { userNameId = '' } = useUrlParams();

  const { data: userData, loading: loadingUser } = useUserAccountQuery({
    variables: {
      userId: userNameId,
    },
    skip: !userNameId,
  });

  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: {
      accountId: userData?.user.account?.id!,
    },
    skip: !userData?.user.account?.id,
  });

  return (
    <UserAdminLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountHostName={userData?.user.profile?.displayName ?? ''}
        account={accountData?.lookup.account}
        loading={loadingUser || loadingAccount}
      />
    </UserAdminLayout>
  );
};

export default UserAdminAccountPage;
