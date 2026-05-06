import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import Loading from '@/core/ui/loading/Loading';
import { MeUserProvider } from '@/domain/community/user/routing/MeUserContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import CrdUserProfilePage from './publicProfile/CrdUserProfilePage';

// User settings/admin shell — owned by sibling spec 097-crd-user-settings.
// Until 097 lands, the settings subtree falls back to the existing MUI
// admin route.
const MuiUserAdminRoute = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/userAdmin/routing/UserAdminRoute')
);

const CrdMeUserRoute = () => {
  const { t } = useTranslation();
  const { userModel, loadingMe } = useCurrentUserContext();

  if (loadingMe) {
    return <Loading text={t('pages.user-profile.loading')} />;
  }

  // Auth resolved with no current user — the parent NoIdentityRedirect handles
  // redirect, but render Error404 as a safety net so we never spin forever.
  if (!userModel) {
    return (
      <CrdLayoutWrapper>
        <Error404 />
      </CrdLayoutWrapper>
    );
  }

  return (
    <MeUserProvider userId={userModel.id}>
      <Outlet />
    </MeUserProvider>
  );
};

export const CrdUserRoutes = () => (
  <Routes>
    <Route path="me/*" element={<CrdMeUserRoute />}>
      <Route path="" element={<CrdLayoutWrapper />}>
        <Route index={true} element={<CrdUserProfilePage />} />
        <Route
          path="settings/*"
          element={
            <Suspense fallback={<Loading />}>
              <MuiUserAdminRoute />
            </Suspense>
          }
        />
      </Route>
    </Route>
    <Route path={`:${nameOfUrl.userNameId}/*`}>
      <Route path="" element={<CrdLayoutWrapper />}>
        <Route index={true} element={<CrdUserProfilePage />} />
        <Route
          path="settings/*"
          element={
            <Suspense fallback={<Loading />}>
              <MuiUserAdminRoute />
            </Suspense>
          }
        />
      </Route>
    </Route>
    <Route
      path="*"
      element={
        <CrdLayoutWrapper>
          <Error404 />
        </CrdLayoutWrapper>
      }
    />
  </Routes>
);

export default CrdUserRoutes;
