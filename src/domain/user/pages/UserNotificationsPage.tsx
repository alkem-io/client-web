import React, { FC, useMemo } from 'react';

import { useResolvedPath } from 'react-router-dom';
import UserNotificationsContainer from '../../../containers/user/UserNotificationsContainer';
import { useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages';
import UserNotificationsPageView from '../views/UserNotificationsPageView';

export interface UserNotificationsPageProps extends PageProps {}

const UserNotificationsPage: FC<UserNotificationsPageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
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
