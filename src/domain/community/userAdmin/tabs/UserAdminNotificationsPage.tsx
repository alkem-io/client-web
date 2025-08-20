import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import UserNotificationsPageView from '../views/UserAdminNotificationsPageView';
import { useMemo } from 'react';
import { sortBy } from 'lodash';
import {
  useUpdatePreferenceOnUserMutation,
  useUserNotificationsPreferencesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { PreferenceType } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const UserAdminNotificationsPage = () => {
  const { userId, loading: urlResolverLoading } = useUrlResolver();
  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  const [updatePreferenceOnUser] = useUpdatePreferenceOnUserMutation();
  const updatePreference = (type: PreferenceType, checked: boolean, id: string) => {
    if (!userId) {
      return;
    }

    updatePreferenceOnUser({
      variables: {
        userId,
        type: type,
        value: checked ? 'true' : 'false',
      },
      optimisticResponse: {
        updatePreferenceOnUser: {
          id: id,
          __typename: 'Preference',
          value: checked ? 'true' : 'false',
        },
      },
    });
  };

  const preferences = useMemo(
    () => sortBy(data?.lookup.user?.preferences ?? [], x => x.definition.displayName),
    [data]
  );

  return (
    <UserAdminLayout currentTab={SettingsSection.Notifications}>
      <UserNotificationsPageView
        preferences={preferences}
        loading={loading || urlResolverLoading}
        updatePreference={updatePreference}
      />
    </UserAdminLayout>
  );
};

export default UserAdminNotificationsPage;
