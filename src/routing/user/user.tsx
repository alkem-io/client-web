import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import { UserProfilePage } from '../../pages/User/UserProfilePage';

export const UserRoute: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/:userId`}>
        <UserProfilePage />
      </Route>
      <Route exact path={`${path}/:userId/edit`}>
        <EditUserProfilePage />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default UserRoute;
