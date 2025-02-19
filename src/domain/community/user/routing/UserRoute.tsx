import { Outlet, Route, Routes } from 'react-router-dom';
import UserProfilePage from '../userProfilePage/UserProfilePage';
import { Error404 } from '@/core/pages/Errors/Error404';
import UserAdminRoute from '../../userAdmin/routing/UserAdminRoute';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { nameOfUrl } from '@/main/routing/urlParams';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

const UserElement = withUrlResolverParams(() => <Outlet />);

export const UserRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.userNameId}/*`} element={<UserElement />}>
      <Route path="" element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<UserProfilePage />} />
      </Route>
      <Route path={'settings/*'} element={<UserAdminRoute />} />
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

export default withUrlResolverParams(UserRoute);
