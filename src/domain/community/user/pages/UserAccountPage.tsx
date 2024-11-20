import { useAccountInformationQuery, useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import UserSettingsLayout from '@/domain/platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { useUrlParams } from '@/core/routing/useUrlParams';
import ContributorAccountView from '@/domain/community/contributor/Account/ContributorAccountView';

export const UserAccountPage = () => {
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
    <UserSettingsLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountHostName={userData?.user.profile?.displayName ?? ''}
        account={accountData?.lookup.account}
        loading={loadingUser || loadingAccount}
      />
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
