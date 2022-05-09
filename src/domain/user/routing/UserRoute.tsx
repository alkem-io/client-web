import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import UserProfilePage from '../pages/UserProfilePage';
import { Error404 } from '../../../pages';
import UserSettingsRoute from './UserSettingsRoute';

export const UserRoute: FC = () => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'user profile', real: true }], [url]);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<UserProfilePage paths={currentPaths} />}></Route>
        <Route path={'settings/*'} element={<UserSettingsRoute paths={currentPaths} />}></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
export default UserRoute;
