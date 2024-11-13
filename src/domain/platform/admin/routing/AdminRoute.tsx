import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@core/analytics/SentryTransactionScopeContext';
import { Error404 } from '@core/pages/Errors/Error404';
import NonPlatformAdminRedirect from '../../../../main/admin/NonPlatformAdminRedirect';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { AdminOrganizationsRoutes } from '../organization';
import { UsersRoute } from '../user/routing/UsersRoute';
import { SpacesRoute } from '../space/routing/SpacesRoute';
import NoIdentityRedirect from '@core/routing/NoIdentityRedirect';
import AdminInnovationPacksRoutes from '../../../InnovationPack/admin/AdminInnovationPackRoutes';
import AdminInnovationHubsRoutes from '../../../innovationHub/InnovationHubsAdmin/InnovationHubsAdminRoutes';
import VirtualContributorsRoutes from '../virtual-contributors/VirtualContributorsRoutes';
import AuthorizationPoliciesPage from '../../../../main/admin/authorizationPolicies/AuthorizationPoliciesPage';

const AdminRoute: FC = () => {
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
