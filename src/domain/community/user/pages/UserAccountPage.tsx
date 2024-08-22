import React, { FC } from 'react';
import { useUserAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ContributorAccountView from '../../../platform/admin/components/Common/ContributorAccountView';

interface UserAccountPageProps {}

export const UserAccountPage: FC<UserAccountPageProps> = () => {
  const { userNameId = '' } = useUrlParams();

  const { data, loading } = useUserAccountQuery({
    variables: {
      userId: userNameId,
    },
    skip: !userNameId,
  });

  return (
    <UserSettingsLayout currentTab={SettingsSection.Account}>
      <ContributorAccountView
        accountHostName={data?.user.profile?.displayName ?? ''}
        account={data?.user?.account}
        loading={loading}
      />
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
