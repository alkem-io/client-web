import { lazy, type ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import Loading from '@/core/ui/loading/Loading';
import { AdminSectionPlaceholder } from '@/crd/components/admin/AdminSectionPlaceholder';
import NonPlatformAdminRedirect from '@/main/admin/NonPlatformAdminRedirect';
import { ADMIN_SECTIONS, type AdminSectionId, DEFAULT_ADMIN_SECTION } from './adminSections';
import CrdAdminShellPage from './CrdAdminShellPage';

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
export const CrdAdminRoutes = () => (
  <NoIdentityRedirect>
    <NonPlatformAdminRedirect>
      <Routes>
        <Route path="" element={<CrdAdminShellPage />}>
          <Route index={true} element={<Navigate to={DEFAULT_ADMIN_SECTION} replace={true} />} />
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
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </NonPlatformAdminRedirect>
  </NoIdentityRedirect>
);

export default CrdAdminRoutes;
