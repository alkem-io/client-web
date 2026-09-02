import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import CrdVCSettingsPage from './CrdVCSettingsPage';

const CrdVCProfileTab = lazy(() => import('./profile/CrdVCProfileTab'));
const CrdVCMembershipTab = lazy(() => import('./membership/CrdVCMembershipTab'));
const CrdVCSettingsTab = lazy(() => import('./settings/CrdVCSettingsTab'));

/**
 * Routes the VC settings sub-tree (`/vc/<vcNameId>/settings/*`).
 *
 * All three tabs (Profile, Membership, Settings) are wired with their CRD
 * per-tab components. The shell + tab strip live in `CrdVCSettingsPage`.
 */
export const CrdVCSettingsRoutes = () => (
  <Routes>
    <Route path="" element={<CrdVCSettingsPage />}>
      <Route index={true} element={<Navigate to="profile" replace={true} />} />
      <Route
        path="profile"
        element={
          <Suspense fallback={<Loading />}>
            <CrdVCProfileTab />
          </Suspense>
        }
      />
      <Route
        path="membership"
        element={
          <Suspense fallback={<Loading />}>
            <CrdVCMembershipTab />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={<Loading />}>
            <CrdVCSettingsTab />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="profile" replace={true} />} />
    </Route>
  </Routes>
);

export default CrdVCSettingsRoutes;
