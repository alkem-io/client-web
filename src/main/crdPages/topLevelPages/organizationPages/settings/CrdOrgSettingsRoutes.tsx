import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import CrdOrgSettingsPage from './CrdOrgSettingsPage';

const CrdOrgProfileTab = lazy(() => import('./profile/CrdOrgProfileTab'));
const CrdOrgAccountTab = lazy(() => import('./account/CrdOrgAccountTab'));
const CrdOrgCommunityTab = lazy(() => import('./community/CrdOrgCommunityTab'));
const CrdOrgAuthorizationTab = lazy(() => import('./authorization/CrdOrgAuthorizationTab'));
const CrdOrgSettingsTab = lazy(() => import('./settings/CrdOrgSettingsTab'));
const CrdOrgVCCreationWizardPage = lazy(
  () => import('@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdOrgVCCreationWizardPage')
);

/**
 * Routes the Org settings sub-tree (`/organization/<orgSlug>/settings/*`).
 *
 * All five tabs (Profile, Account, Community, Authorization, Settings) are
 * wired with their CRD per-tab components. The shell + tab strip live in
 * `CrdOrgSettingsPage`.
 */
export const CrdOrgSettingsRoutes = () => (
  <Routes>
    {/* Full-page VC creation wizard — outside the settings-tab shell so the tab nav is hidden. */}
    <Route
      path="create-virtual-contributor"
      element={
        <Suspense fallback={<Loading />}>
          <CrdOrgVCCreationWizardPage />
        </Suspense>
      }
    />
    <Route path="" element={<CrdOrgSettingsPage />}>
      <Route index={true} element={<Navigate to="profile" replace={true} />} />
      <Route
        path="profile"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgProfileTab />
          </Suspense>
        }
      />
      <Route
        path="account"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgAccountTab />
          </Suspense>
        }
      />
      <Route
        path="community"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgCommunityTab />
          </Suspense>
        }
      />
      <Route
        path="authorization"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgAuthorizationTab />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgSettingsTab />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="profile" replace={true} />} />
    </Route>
  </Routes>
);

export default CrdOrgSettingsRoutes;
