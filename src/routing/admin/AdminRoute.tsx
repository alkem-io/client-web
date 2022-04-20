import React, { FC, useMemo } from 'react';
import { Route, Routes, Navigate, useResolvedPath } from 'react-router-dom';
import { useTransactionScope } from '../../hooks';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { Error404 } from '../../pages';
import RestrictedRoute from '../RestrictedRoute';
import { HubsRoute } from './hub/HubsRoute';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { AdminOrganizationsRoutes } from '../../domain/admin/organization';
import { UsersRoute } from './users/UsersRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

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
        <Route path="users/*" element={<UsersRoute paths={currentPaths} />} />
        <Route path="authorization/*" element={<GlobalAuthorizationRoute paths={currentPaths} />} />
        <Route path="organizations/*" element={<AdminOrganizationsRoutes paths={currentPaths} />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </RestrictedRoute>
  );
};
