import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import ManagementPageTemplate from '../../components/Admin/ManagementPageTemplate';
import { useTransactionScope } from '../../hooks';
import { FourOuFour } from '../../pages';
import { EcoverseListAdminRoute } from './ecoverse/ecoverse';
import { OrganizationsRoute } from './organization/organization';
import { UsersRoute } from './user';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';

export const Admin: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ManagementPageTemplate data={managementData.adminLvl} paths={currentPaths} />
      </Route>
      <Route path={`${path}/users`}>
        <UsersRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/authorization`}>
        <GlobalAuthorizationRoute paths={currentPaths} />
      </Route>
      <Route path={`${path}/ecoverses`}>
        <EcoverseListAdminRoute paths={currentPaths} />
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
