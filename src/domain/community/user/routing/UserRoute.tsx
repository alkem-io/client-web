import { Route, Routes } from 'react-router-dom';
import UserProfilePage from '../userProfilePage/UserProfilePage';
import { Error404 } from '@/core/pages/Errors/Error404';
import UserAdminRoute from '../../userAdmin/routing/UserAdminRoute';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { nameOfUrl } from '@/main/routing/urlParams';
import UserPageLayout from '../layout/UserPageLayout';
import UserMeRoute from './UserMeRoute';

export const UserRoute = () => (
  <Routes>
    <Route path="me/*" element={<UserMeRoute />}>
      <Route path="" element={<UserPageLayout />}>
        <Route index element={<UserProfilePage />} />
        <Route path="settings/*" element={<UserAdminRoute />} />
      </Route>
    </Route>
    <Route path={`:${nameOfUrl.userNameId}/*`}>
      <Route path="" element={<UserPageLayout />}>
        <Route index element={<UserProfilePage />} />
        <Route path="settings/*" element={<UserAdminRoute />} />
      </Route>
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

export default UserRoute;
