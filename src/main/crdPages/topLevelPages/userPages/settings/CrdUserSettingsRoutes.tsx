import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import { PlaceholderTab } from './_placeholder/PlaceholderTab';
import CrdUserSettingsPage from './CrdUserSettingsPage';

const CrdUserProfileTab = lazy(() => import('./profile/CrdUserProfileTab'));

type UserPlaceholderKey =
  | 'shell.tabs.user.account'
  | 'shell.tabs.user.membership'
  | 'shell.tabs.user.organizations'
  | 'shell.tabs.user.notifications'
  | 'shell.tabs.user.settings'
  | 'shell.tabs.user.security';

/**
 * Renders a placeholder tab body with its label resolved via the
 * `crd-contributorSettings` namespace. The namespace is loaded lazily on
 * first use.
 */
const PlaceholderRoute = ({ labelKey }: { labelKey: UserPlaceholderKey }) => {
  const { t } = useTranslation('crd-contributorSettings');
  return <PlaceholderTab tabLabelKey={t(labelKey)} />;
};

/**
 * Routes the User settings sub-tree (`/user/<slug>/settings/*`).
 *
 * The shell route resolves the URL → active tab id via
 * `useUserSettingsTab`, then renders `<Outlet />` for the active tab body.
 * Per-tab phases progressively replace the placeholder children with their
 * real views.
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
      <Route path="account" element={<PlaceholderRoute labelKey="shell.tabs.user.account" />} />
      <Route path="membership" element={<PlaceholderRoute labelKey="shell.tabs.user.membership" />} />
      <Route path="organizations" element={<PlaceholderRoute labelKey="shell.tabs.user.organizations" />} />
      <Route path="notifications" element={<PlaceholderRoute labelKey="shell.tabs.user.notifications" />} />
      <Route path="settings" element={<PlaceholderRoute labelKey="shell.tabs.user.settings" />} />
      <Route path="security" element={<PlaceholderRoute labelKey="shell.tabs.user.security" />} />
      <Route path="*" element={<Navigate to="profile" replace={true} />} />
    </Route>
  </Routes>
);

export default CrdUserSettingsRoutes;
