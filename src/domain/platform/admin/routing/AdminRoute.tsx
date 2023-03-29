import React, { FC, useMemo } from 'react';
import { Route, Routes, Navigate, useResolvedPath } from 'react-router-dom';
import { useTransactionScope } from '../../../../core/analytics/useSentry';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import RestrictedRoute from '../../../../core/routing/RestrictedRoute';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { AdminOrganizationsRoutes } from '../organization';
import { UsersRoute } from '../user/routing/UsersRoute';
import { HubsRoute } from '../hub/routing/HubsRoute';
import AdminInnovationPacksRoutes from '../templates/InnovationPacks/admin/AdminInnovationPackRoutes';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], [url]);

  return (
    <RestrictedRoute
      requiredCredentials={[
        AuthorizationCredential.GlobalAdmin,
        AuthorizationCredential.HubAdmin,
        AuthorizationCredential.OrganizationAdmin,
        AuthorizationCredential.ChallengeAdmin,
        AuthorizationCredential.GlobalAdminCommunity,
        AuthorizationCredential.OrganizationOwner,
        AuthorizationCredential.OpportunityAdmin,
      ]}
    >
      <Routes>
        <Route index element={<Navigate to="hubs" replace />} />
        <Route path="hubs/*" element={<HubsRoute paths={currentPaths} />} />
        <Route path="users/*" element={<UsersRoute />} />
        <Route path="authorization/*" element={<GlobalAuthorizationRoute />} />
        <Route path="organizations/*" element={<AdminOrganizationsRoutes />} />
        <Route path="innovation-packs/*" element={<AdminInnovationPacksRoutes />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </RestrictedRoute>
  );
};
