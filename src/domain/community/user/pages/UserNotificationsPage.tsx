import React, { FC, useMemo } from 'react';

import { useResolvedPath } from 'react-router-dom';
import UserNotificationsContainer from '../containers/UserNotificationsContainer';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { PageProps } from '../../../shared/types/PageProps';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import UserNotificationsPageView from '../views/UserNotificationsPageView';

export interface UserNotificationsPageProps extends PageProps {}

const UserNotificationsPage: FC<UserNotificationsPageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'notifications', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <UserSettingsLayout currentTab={SettingsSection.Notifications}>
      <UserNotificationsContainer>
        {(entities, state, actions) => (
          <UserNotificationsPageView entities={entities} actions={actions} state={state} options={{}} />
        )}
      </UserNotificationsContainer>
    </UserSettingsLayout>
  );
};

export default UserNotificationsPage;
