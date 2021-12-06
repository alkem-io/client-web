import React, { FC } from 'react';
import UserNotificationsContainer from '../../containers/user/UserNotificationsContainer';
import UserNotificationsPageView from '../../views/User/UserNotificationsPageView';

export interface UserNotificationsPageProps {}

const UserNotificationsPage: FC<UserNotificationsPageProps> = () => {
  return (
    <UserNotificationsContainer>
      {(entities, state, actions) => (
        <UserNotificationsPageView entities={entities} actions={actions} state={state} options={{}} />
      )}
    </UserNotificationsContainer>
  );
};
export default UserNotificationsPage;
