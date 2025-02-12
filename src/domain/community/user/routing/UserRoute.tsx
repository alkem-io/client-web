import { Route, Routes } from 'react-router-dom';
import UserProfilePage from '../userProfilePage/UserProfilePage';
import { Error404 } from '@/core/pages/Errors/Error404';
import UserAdminRoute from '../../userAdmin/routing/UserAdminRoute';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { nameOfUrl } from '@/main/routing/urlParams';
import { UrlParamsChangedProvider } from '@/main/routing/urlResolver/UrlParamsChangedProvider';

export const UserRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.userNameId}/*`}>
      <Route path="" element={<PageLayoutHolderWithOutlet />}>
        <Route
          index
          element={
            <UrlParamsChangedProvider>
              <UserProfilePage />
            </UrlParamsChangedProvider>
          }
        />
      </Route>
      <Route
        path={'settings/*'}
        element={
          <UrlParamsChangedProvider>
            <UserAdminRoute />
          </UrlParamsChangedProvider>
        }
      />
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
