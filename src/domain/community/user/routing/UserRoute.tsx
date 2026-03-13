import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import UserAdminRoute from '../../userAdmin/routing/UserAdminRoute';
import UserPageLayout from '../layout/UserPageLayout';
import UserProfilePage from '../userProfilePage/UserProfilePage';
import UserMeRoute from './UserMeRoute';

export const UserRoute = () => (
  <Routes>
    <Route path="me/*" element={<UserMeRoute />}>
      <Route path="" element={<UserPageLayout />}>
        <Route index={true} element={<UserProfilePage />} />
        <Route path="settings/*" element={<UserAdminRoute />} />
      </Route>
    </Route>
    <Route path={`:${nameOfUrl.userNameId}/*`}>
      <Route path="" element={<UserPageLayout />}>
        <Route index={true} element={<UserProfilePage />} />
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
