import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import CrdUserSettingsPage from './CrdUserSettingsPage';

const CrdUserProfileTab = lazy(() => import('./profile/CrdUserProfileTab'));
const CrdUserAccountTab = lazy(() => import('./account/CrdUserAccountTab'));
const CrdUserMembershipTab = lazy(() => import('./membership/CrdUserMembershipTab'));
const CrdUserOrganizationsTab = lazy(() => import('./organizations/CrdUserOrganizationsTab'));
const CrdUserNotificationsTab = lazy(() => import('./notifications/CrdUserNotificationsTab'));
const CrdUserAssistantTab = lazy(() => import('./assistant/CrdUserAssistantTab'));
const CrdUserSettingsTab = lazy(() => import('./settings/CrdUserSettingsTab'));
const CrdUserSecurityTab = lazy(() => import('./security/CrdUserSecurityTab'));

/**
 * Routes the User settings sub-tree (`/user/<slug>/settings/*`).
 *
 * The shell route resolves the URL → active tab id via
 * `useUserSettingsTab`, then renders `<Outlet />` for the active tab body.
 */
export const CrdUserSettingsRoutes = () => (
  <Routes>
    <Route path="" element={<CrdUserSettingsPage />}>
      <Route index={true} element={<Navigate to="profile" replace={true} />} />
      <Route
        path="profile"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserProfileTab />
          </Suspense>
        }
      />
      <Route
        path="account"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserAccountTab />
          </Suspense>
        }
      />
      <Route
        path="membership"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserMembershipTab />
          </Suspense>
        }
      />
      <Route
        path="organizations"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserOrganizationsTab />
          </Suspense>
        }
      />
      <Route
        path="notifications"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserNotificationsTab />
          </Suspense>
        }
      />
      <Route
        path="assistant"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserAssistantTab />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserSettingsTab />
          </Suspense>
        }
      />
      <Route
        path="security"
        element={
          <Suspense fallback={<Loading />}>
            <CrdUserSecurityTab />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="profile" replace={true} />} />
    </Route>
  </Routes>
);

export default CrdUserSettingsRoutes;
