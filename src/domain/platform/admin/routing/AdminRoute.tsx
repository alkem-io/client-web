import React, { FC, useMemo } from 'react';
import { Route, Routes, Navigate, useResolvedPath } from 'react-router-dom';
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

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], [url]);

  return (
    <NoIdentityRedirect>
      <NonAdminRedirect>
        <Routes>
          <Route index element={<Navigate to="spaces" replace />} />
          <Route path="spaces/*" element={<SpacesRoute paths={currentPaths} />} />
          <Route path="users/*" element={<UsersRoute />} />
          <Route path="authorization/*" element={<GlobalAuthorizationRoute />} />
          <Route path="organizations/*" element={<AdminOrganizationsRoutes />} />
          <Route path="innovation-packs/*" element={<AdminInnovationPacksRoutes />} />
          <Route path="innovation-hubs/*" element={<AdminInnovationHubsRoutes />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </NonAdminRedirect>
    </NoIdentityRedirect>
  );
};
