import React, { FC, useMemo } from 'react';
import { Route, Routes, Navigate, useResolvedPath } from 'react-router-dom';
import { useTransactionScope } from '../../../../core/analytics/useSentry';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import NonAdminRedirect from '../../../../core/routing/NonAdminRedirect';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { AdminOrganizationsRoutes } from '../organization';
import { UsersRoute } from '../user/routing/UsersRoute';
import { HubsRoute } from '../hub/routing/HubsRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], [url]);

  return (
    <NonAdminRedirect>
      <Routes>
        <Route index element={<Navigate to="hubs" replace />} />
        <Route path="hubs/*" element={<HubsRoute paths={currentPaths} />} />
        <Route path="users/*" element={<UsersRoute />} />
        <Route path="authorization/*" element={<GlobalAuthorizationRoute />} />
        <Route path="organizations/*" element={<AdminOrganizationsRoutes />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </NonAdminRedirect>
  );
};
