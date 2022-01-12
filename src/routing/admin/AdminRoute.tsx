import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import { useTransactionScope } from '../../hooks';
import { Error404 } from '../../pages';
import ManagementPageTemplatePage from '../../pages/Admin/ManagementPageTemplatePage';
import { EcoversesRoute } from './ecoverse/EcoversesRoute';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { OrganizationsRoute } from './organization/OrganizationsRoute';
import { UsersRoute } from './users/UsersRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const url = '';
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <Routes>
      <Route>
        <ManagementPageTemplatePage data={managementData.adminLvl} paths={currentPaths} />
      </Route>
      <Route path={'users'}>
        <UsersRoute paths={currentPaths} />
      </Route>
      <Route path={'authorization'}>
        <GlobalAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path={'hubs'}>
        <EcoversesRoute paths={currentPaths} />
      </Route>
      <Route path={'organizations'}>
        <OrganizationsRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
