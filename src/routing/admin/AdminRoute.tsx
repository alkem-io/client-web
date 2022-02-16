import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import { useTransactionScope } from '../../hooks';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { Error404 } from '../../pages';
import ManagementPageTemplatePage from '../../pages/Admin/ManagementPageTemplatePage';
import RestrictedRoute from '../RestrictedRoute';
import { EcoversesRoute } from './hub/EcoversesRoute';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { OrganizationsRoute } from './organization/OrganizationsRoute';
import { UsersRoute } from './users/UsersRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <RestrictedRoute
      requiredCredentials={[
        AuthorizationCredential.GlobalAdmin,
        AuthorizationCredential.EcoverseAdmin,
        AuthorizationCredential.OrganizationAdmin,
        AuthorizationCredential.ChallengeAdmin,
        AuthorizationCredential.GlobalAdminCommunity,
        AuthorizationCredential.OrganizationOwner,
        AuthorizationCredential.OpportunityAdmin,
      ]}
    >
      <Routes>
        <Route path={'/'}>
          <Route
            index
            element={<ManagementPageTemplatePage data={managementData.adminLvl} paths={currentPaths} />}
          ></Route>
          <Route path={'users/*'} element={<UsersRoute paths={currentPaths} />}></Route>
          <Route path={'authorization/*'} element={<GlobalAuthorizationRoute paths={currentPaths} />}></Route>
          <Route path={'hubs/*'} element={<EcoversesRoute paths={currentPaths} />}></Route>
          <Route path={'organizations/*'} element={<OrganizationsRoute paths={currentPaths} />}></Route>
          <Route path="*" element={<Error404 />}></Route>
        </Route>
        <Route path="*" element={<Error404 />}></Route>
      </Routes>
    </RestrictedRoute>
  );
};
