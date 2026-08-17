import { lazy, type ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import Loading from '@/core/ui/loading/Loading';
import { AdminSectionPlaceholder } from '@/crd/components/admin/AdminSectionPlaceholder';
import NonPlatformAdminRedirect from '@/main/admin/NonPlatformAdminRedirect';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { ADMIN_SECTIONS, type AdminSectionId, DEFAULT_ADMIN_SECTION } from './adminSections';
import CrdAdminShellPage from './CrdAdminShellPage';
import { useVisibleAdminSections } from './useVisibleAdminSections';

const CrdAdminUsersRoutes = lazy(() => import('./users/CrdAdminUsersRoutes'));
const CrdAdminSpacesPage = lazy(() => import('./spaces/CrdAdminSpacesPage'));
const CrdAdminOrganizationsRoutes = lazy(() => import('./organizations/CrdAdminOrganizationsRoutes'));
const CrdAdminInnovationPacksPage = lazy(() => import('./innovationPacks/CrdAdminInnovationPacksPage'));
const CrdAdminInnovationHubsPage = lazy(() => import('./innovationHubs/CrdAdminInnovationHubsPage'));
const CrdAdminVirtualContributorsPage = lazy(() => import('./virtualContributors/CrdAdminVirtualContributorsPage'));
const CrdAdminGlobalRolesPage = lazy(() => import('./authorization/CrdAdminGlobalRolesPage'));
const CrdAdminAuthorizationPoliciesPage = lazy(
  () => import('./authorizationPolicies/CrdAdminAuthorizationPoliciesPage')
);
const CrdAdminTransferPage = lazy(() => import('./transfer/CrdAdminTransferPage'));

/** Migrated section bodies. Sections not listed render the placeholder. */
const SECTION_ELEMENTS: Partial<Record<AdminSectionId, ReactNode>> = {
  spaces: <CrdAdminSpacesPage />,
  users: <CrdAdminUsersRoutes />,
  organizations: <CrdAdminOrganizationsRoutes />,
  'innovation-packs': <CrdAdminInnovationPacksPage />,
  'innovation-hubs': <CrdAdminInnovationHubsPage />,
  'virtual-contributors': <CrdAdminVirtualContributorsPage />,
  authorization: <CrdAdminGlobalRolesPage />,
  'authorization-policies': <CrdAdminAuthorizationPoliciesPage />,
  transfer: <CrdAdminTransferPage />,
};

/**
 * CRD global-admin route tree (`/admin/*` when the CRD design version is on).
 *
 * Gating mirrors the MUI `PlatformAdminRoute` exactly: anonymous users are sent
 * to login (`NoIdentityRedirect`) and non-platform-admins are redirected
 * (`NonPlatformAdminRedirect` → `/restricted`). The shell renders the section
 * navigation; each section currently renders a placeholder body and is replaced
 * by its real page as that section is migrated (US2+).
 */
/**
 * `/admin` must land on a section the user can actually use. The fixed
 * `DEFAULT_ADMIN_SECTION` ('spaces') sent a `platform-roles-admin` straight to
 * a page they cannot operate — and, once the nav was filtered, to a section
 * that is not even listed. Falls back to the fixed default while the privilege
 * query is in flight or if nothing is visible.
 */
const AdminIndexRedirect = () => {
  const { sections, loading } = useVisibleAdminSections();
  if (loading) {
    return <Loading />;
  }
  return <Navigate to={sections[0]?.id ?? DEFAULT_ADMIN_SECTION} replace={true} />;
};

export const CrdAdminRoutes = () => (
  <NoIdentityRedirect>
    <NonPlatformAdminRedirect>
      <Routes>
        <Route path="" element={<CrdAdminShellPage />}>
          <Route index={true} element={<AdminIndexRedirect />} />
          {ADMIN_SECTIONS.map(section => (
            <Route
              key={section.id}
              path={`${section.id}/*`}
              element={
                <Suspense fallback={<Loading />}>
                  {SECTION_ELEMENTS[section.id] ?? <AdminSectionPlaceholder />}
                </Suspense>
              }
            />
          ))}
          <Route path="*" element={<CrdNotFoundView />} />
        </Route>
      </Routes>
    </NonPlatformAdminRedirect>
  </NoIdentityRedirect>
);

export default CrdAdminRoutes;
