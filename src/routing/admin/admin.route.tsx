import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplatePage from '../../pages/Admin/ManagementPageTemplatePage';
import { useTransactionScope } from '../../hooks';
import { FourOuFour } from '../../pages';
import { EcoversesAdminRoute } from './ecoverse/ecoverses.admin.route';
import { OrganizationsRoute } from './organization/organization';
import { UsersRoute } from './users/users.route';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <Switch>
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
        <EcoversesAdminRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/organizations`}>
        <OrganizationsRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
