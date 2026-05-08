import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import Loading from '@/core/ui/loading/Loading';
import { MeUserProvider } from '@/domain/community/user/routing/MeUserContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import CrdUserProfilePage from './publicProfile/CrdUserProfilePage';

const CrdUserSettingsRoutes = lazyWithGlobalErrorHandler(() => import('./settings/CrdUserSettingsRoutes'));

const MuiUserAdminRoute = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/userAdmin/routing/UserAdminRoute')
);

const UserSettingsDispatch = () => {
  const crdEnabled = useCrdEnabled();
  return <Suspense fallback={<Loading />}>{crdEnabled ? <CrdUserSettingsRoutes /> : <MuiUserAdminRoute />}</Suspense>;
};

const CrdMeUserRoute = () => {
  const { t } = useTranslation();
  const { userModel, loadingMe } = useCurrentUserContext();

  if (loadingMe) {
    return <Loading text={t('pages.user-profile.loading')} />;
  }

  // Safety net — NoIdentityRedirect should already redirect, but render Error404
  // if auth resolved with no current user so we never spin forever.
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
        <Route path="settings/*" element={<UserSettingsDispatch />} />
      </Route>
    </Route>
    <Route path={`:${nameOfUrl.userNameId}/*`}>
      <Route path="" element={<CrdLayoutWrapper />}>
        <Route index={true} element={<CrdUserProfilePage />} />
        <Route path="settings/*" element={<UserSettingsDispatch />} />
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
