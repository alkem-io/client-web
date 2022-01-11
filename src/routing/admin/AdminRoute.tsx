import React, { FC, useMemo } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplatePage from '../../pages/Admin/ManagementPageTemplatePage';
import { useTransactionScope } from '../../hooks';
import { Error404 } from '../../pages';
import { EcoversesRoute } from './ecoverse/EcoversesRoute';
import { UsersRoute } from './users/UsersRoute';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { OrganizationsRoute } from './organization/OrganizationsRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <Routes>
      <Route exact path={`${path}`}>
        <ManagementPageTemplatePage data={managementData.adminLvl} paths={currentPaths} />
      </Route>
      <Route path={`${path}/users`}>
        <UsersRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <GlobalAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/hubs`}>
        <EcoversesRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/organizations`}>
        <OrganizationsRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
