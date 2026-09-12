import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import CrdOrgSettingsPage from './CrdOrgSettingsPage';

const CrdOrgProfileTab = lazy(() => import('./profile/CrdOrgProfileTab'));
const CrdOrgAccountTab = lazy(() => import('./account/CrdOrgAccountTab'));
const CrdOrgAssociatesTab = lazy(() => import('./community/CrdOrgAssociatesTab'));
const CrdOrgInvitationsTab = lazy(() => import('./invitations/CrdOrgInvitationsTab'));
const CrdOrgSettingsTab = lazy(() => import('./settings/CrdOrgSettingsTab'));

/**
 * Routes the Org settings sub-tree (`/organization/<orgSlug>/settings/*`).
 *
 * Five tabs (Profile, Account, Associates, Invitations, Settings) are wired
 * with their CRD per-tab components. The Authorization tab is gone (D14):
 * the Associates tab editor now covers Admin/Owner add-remove, and the old
 * `/settings/authorization` URL redirects explicitly to `../community`
 * rather than falling through to the generic catch-all (which would land on
 * Profile — a worse destination than a 404 for a bookmarked/shared link).
 * The shell + tab strip live in `CrdOrgSettingsPage`.
 */
export const CrdOrgSettingsRoutes = () => (
  <Routes>
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
            <CrdOrgAssociatesTab />
          </Suspense>
        }
      />
      <Route
        path="invitations"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgInvitationsTab />
          </Suspense>
        }
      />
      {/* Must precede the catch-all below so a matched "authorization" segment redirects
          explicitly rather than falling through to the generic Navigate to="profile".
          Exactly ONE route may declare this path: react-router resolves a tie between
          siblings to the earlier one, so a second declaration silently wins and this
          redirect never runs. */}
      <Route path="authorization" element={<Navigate to="../community" replace={true} />} />
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
