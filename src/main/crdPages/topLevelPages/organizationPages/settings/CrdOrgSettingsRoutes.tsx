import { lazy, type ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import useCanEditOrganizationSettings from '../useCanEditOrganizationSettings';
import CrdOrgSettingsPage from './CrdOrgSettingsPage';

const CrdOrgProfileTab = lazy(() => import('./profile/CrdOrgProfileTab'));
const CrdOrgAccountTab = lazy(() => import('./account/CrdOrgAccountTab'));
const CrdOrgAssociatesTab = lazy(() => import('./community/CrdOrgAssociatesTab'));
const CrdOrgMembershipTab = lazy(() => import('./membership/CrdOrgMembershipTab'));
const CrdOrgInvitationsTab = lazy(() => import('./invitations/CrdOrgInvitationsTab'));
const CrdOrgSettingsTab = lazy(() => import('./settings/CrdOrgSettingsTab'));

/**
 * The landing tab for the index (and so, via the catch-all, for any unknown segment): Profile for a viewer
 * with full access, Associates for a viewer confined to it. Waits for the privileges
 * so a confined viewer never mounts a tab they cannot use.
 */
const OrgSettingsIndexRedirect = () => {
  const { accessMode, loading } = useCanEditOrganizationSettings();
  if (loading) return <Loading />;
  return <Navigate to={accessMode === 'community-only' ? 'associates' : 'profile'} replace={true} />;
};

/**
 * Wraps every tab other than Associates: a viewer confined to the Associates tab is
 * sent there instead of seeing (and querying) a tab the server would refuse them.
 */
const CommunityOnlyGuard = ({ children }: { children: ReactNode }) => {
  const { accessMode, loading } = useCanEditOrganizationSettings();
  if (loading) return <Loading />;
  if (accessMode === 'community-only') return <Navigate to="../associates" replace={true} />;
  return children;
};

/**
 * Routes the Org settings sub-tree (`/organization/<orgSlug>/settings/*`).
 *
 * Six tabs (Profile, Account, Associates, Membership, Invitations, Settings)
 * are wired with their CRD per-tab components. The Authorization tab is gone:
 * the Associates tab editor now covers Admin/Owner add-remove, and the old
 * `/settings/authorization` URL redirects explicitly to `../associates`
 * rather than falling through to the generic catch-all (which would land on
 * Profile — a worse destination than a 404 for a bookmarked/shared link).
 * The shell + tab strip live in `CrdOrgSettingsPage`.
 *
 * A viewer whose access mode is `community-only` (Platform Support without
 * `Update` on the organization) reaches the Associates tab alone: the index, the
 * catch-all and every other tab redirect there.
 */
export const CrdOrgSettingsRoutes = () => (
  <Routes>
    <Route path="" element={<CrdOrgSettingsPage />}>
      <Route index={true} element={<OrgSettingsIndexRedirect />} />
      <Route
        path="profile"
        element={
          <CommunityOnlyGuard>
            <Suspense fallback={<Loading />}>
              <CrdOrgProfileTab />
            </Suspense>
          </CommunityOnlyGuard>
        }
      />
      <Route
        path="account"
        element={
          <CommunityOnlyGuard>
            <Suspense fallback={<Loading />}>
              <CrdOrgAccountTab />
            </Suspense>
          </CommunityOnlyGuard>
        }
      />
      <Route
        path="associates"
        element={
          <Suspense fallback={<Loading />}>
            <CrdOrgAssociatesTab />
          </Suspense>
        }
      />
      {/* The tab was renamed from Community to Associates as part of #1897; keep the old
          /settings/community URL working for bookmarked and shared links. */}
      <Route path="community" element={<Navigate to="../associates" replace={true} />} />
      <Route
        path="membership"
        element={
          <CommunityOnlyGuard>
            <Suspense fallback={<Loading />}>
              <CrdOrgMembershipTab />
            </Suspense>
          </CommunityOnlyGuard>
        }
      />
      <Route
        path="invitations"
        element={
          <CommunityOnlyGuard>
            <Suspense fallback={<Loading />}>
              <CrdOrgInvitationsTab />
            </Suspense>
          </CommunityOnlyGuard>
        }
      />
      {/* Must precede the catch-all below so a matched "authorization" segment redirects
          explicitly rather than falling through to the generic index redirect.
          Exactly ONE route may declare this path: react-router resolves a tie between
          siblings to the earlier one, so a second declaration silently wins and this
          redirect never runs. */}
      <Route path="authorization" element={<Navigate to="../associates" replace={true} />} />
      <Route
        path="settings"
        element={
          <CommunityOnlyGuard>
            <Suspense fallback={<Loading />}>
              <CrdOrgSettingsTab />
            </Suspense>
          </CommunityOnlyGuard>
        }
      />
      {/* Climb back to the index, which picks the landing tab. A splat route resolves a
          relative target against the whole URL, so "profile" here would append to the unknown
          segment and match this route again, forever. */}
      <Route path="*" element={<Navigate to=".." replace={true} />} />
    </Route>
  </Routes>
);

export default CrdOrgSettingsRoutes;
