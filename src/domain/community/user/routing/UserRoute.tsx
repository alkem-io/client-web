import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import UserProfilePage from '../userProfilePage/UserProfilePage';
import { Error404 } from '@core/pages/Errors/Error404';
import UserSettingsRoute from './UserSettingsRoute';
import { PageLayoutHolderWithOutlet } from '../../../journey/common/EntityPageLayout';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import { nameOfUrl } from '../../../../main/routing/urlParams';

export const UserRoute: FC = () => {
  return (
    <Routes>
      <Route path={`:${nameOfUrl.userNameId}/*`}>
        <Route path="" element={<PageLayoutHolderWithOutlet />}>
          <Route index element={<UserProfilePage />} />
        </Route>
        <Route path={'settings/*'} element={<UserSettingsRoute />} />
      </Route>
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
