import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import UserProfilePage from '../userProfilePage/UserProfilePage';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import UserSettingsRoute from './UserSettingsRoute';
import { EntityPageLayoutHolder } from '../../../journey/common/EntityPageLayout';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';

export const UserRoute: FC = () => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'user profile', real: true }], [url]);

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<UserProfilePage />} />
      </Route>
      <Route path={'settings/*'} element={<UserSettingsRoute paths={currentPaths} />} />
      <Route
        path="*"
        element={
          <TopLevelLayout>
            <Error404 />
          </TopLevelLayout>
        }
      />
    </Routes>
  );
};

export default UserRoute;
