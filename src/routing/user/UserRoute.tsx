import React, { FC, useMemo } from 'react';
import { Route } from 'react-router-dom';
import { Error404 } from '../../pages';
import { UserProfilePage } from '../../pages/User/UserProfilePage';
import UserSettingsRoute from './UserSettingsRoute';

export const UserRoute: FC = () => {
  const url = '';
  const currentPaths = useMemo(() => [{ value: url, name: 'user profile', real: true }], [url]);

  return (
    <>
      <Route>
        <UserProfilePage paths={currentPaths} />
      </Route>
      <Route path={'settings'}>
        <UserSettingsRoute paths={currentPaths} />
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </>
  );
};
export default UserRoute;
