import React, { FC, useMemo } from 'react';
import UserNotificationsContainer from '../../containers/user/UserNotificationsContainer';
import UserNotificationsPageView from '../../views/User/UserNotificationsPageView';
import { PageProps } from '../common';

import { useUpdateNavigation } from '../../hooks';

export interface UserNotificationsPageProps extends PageProps {}

const UserNotificationsPage: FC<UserNotificationsPageProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'notifications', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <UserNotificationsContainer>
      {(entities, state, actions) => (
        <UserNotificationsPageView entities={entities} actions={actions} state={state} options={{}} />
      )}
    </UserNotificationsContainer>
  );
};
export default UserNotificationsPage;
