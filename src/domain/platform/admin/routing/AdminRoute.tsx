import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '../../../../core/analytics/SentryTransactionScopeContext';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import NonAdminRedirect from '../../../../core/routing/NonAdminRedirect';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { AdminOrganizationsRoutes } from '../organization';
import { UsersRoute } from '../user/routing/UsersRoute';
import { SpacesRoute } from '../space/routing/SpacesRoute';
import NoIdentityRedirect from '../../../../core/routing/NoIdentityRedirect';
import AdminInnovationPacksRoutes from '../templates/InnovationPacks/admin/AdminInnovationPackRoutes';
import AdminInnovationHubsRoutes from '../../../innovationHub/InnovationHubsAdmin/InnovationHubsAdminRoutes';
import AISettingsRoutes from '../ai/AISettingsRoutes';
import { VirtualContributorsRoutes } from '../virtualContributors/VirtualContributorsRoutes';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });

  return (
    <NoIdentityRedirect>
      <NonAdminRedirect>
        <Routes>
          <Route index element={<Navigate to="spaces" replace />} />
          <Route path="spaces/*" element={<SpacesRoute />} />
          <Route path="users/*" element={<UsersRoute />} />
          <Route path="virtual-contributors/*" element={<VirtualContributorsRoutes />} />
          <Route path="authorization/*" element={<GlobalAuthorizationRoute />} />
          <Route path="organizations/*" element={<AdminOrganizationsRoutes />} />
          <Route path="innovation-packs/*" element={<AdminInnovationPacksRoutes />} />
          <Route path="innovation-hubs/*" element={<AdminInnovationHubsRoutes />} />
          <Route path="ai-settings/*" element={<AISettingsRoutes />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </NonAdminRedirect>
    </NoIdentityRedirect>
  );
};
