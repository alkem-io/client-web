import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { Error404 } from '@/core/pages/Errors/Error404';
import NonPlatformAdminRedirect from '@/main/admin/NonPlatformAdminRedirect';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { UsersRoute } from '../domain/users/routing/UsersRoute';
import { SpacesRoute } from '../domain/space/routing/SpacesRoute';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import AdminInnovationPacksRoutes from '@/domain/platformAdmin/domain/innovationPacks/AdminInnovationPackRoutes';
import AdminInnovationHubsRoutes from '@/domain/platformAdmin/domain/innovationHubs/InnovationHubsAdminRoutes';
import VirtualContributorsRoutes from '../domain/virtual-contributors/VirtualContributorsRoutes';
import AuthorizationPoliciesPage from '@/main/admin/authorizationPolicies/AuthorizationPoliciesPage';
import AdminOrganizationsRoutes from '../domain/organizations/AdminOrganizationsRoutes';

const AdminRoute = () => {
  useTransactionScope({ type: 'admin' });

  return (
    <NoIdentityRedirect>
      <NonPlatformAdminRedirect>
        <Routes>
          <Route index element={<Navigate to="spaces" replace />} />
          <Route path="spaces/*" element={<SpacesRoute />} />
          <Route path="users/*" element={<UsersRoute />} />
          <Route path="authorization-policies/*" element={<AuthorizationPoliciesPage />} />
          <Route path="authorization/*" element={<GlobalAuthorizationRoute />} />
          <Route path="organizations/*" element={<AdminOrganizationsRoutes />} />
          <Route path="innovation-packs/*" element={<AdminInnovationPacksRoutes />} />
          <Route path="innovation-hubs/*" element={<AdminInnovationHubsRoutes />} />
          <Route path="virtual-contributors/*" element={<VirtualContributorsRoutes />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </NonPlatformAdminRedirect>
    </NoIdentityRedirect>
  );
};

export default AdminRoute;
