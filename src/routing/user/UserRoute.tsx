import React, { FC, useMemo } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../pages';
import { UserProfilePage } from '../../pages/User/UserProfilePage';
import UserSettingsRoute from './UserSettingsRoute';

export const UserRoute: FC = () => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'user profile', real: true }], [url]);

  return (
    <Routes>
      <Route exact path={path}>
        <UserProfilePage paths={currentPaths} />
      </Route>
      <Route path={`${path}/settings`}>
        <UserSettingsRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default UserRoute;
