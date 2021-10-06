import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { CreateOrganizationGroupPage } from '../../../components/Admin/Organization/CreateOrganizationGroup';
import { FourOuFour, PageProps } from '../../../pages';
import { OrganizationGroupsPage } from '../../../pages/Admin/Organization/OrganizationGroupsPage';
import { nameOfUrl } from '../../url-params';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';

export const OrganizationGroupsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OrganizationGroupsPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateOrganizationGroupPage paths={currentPaths} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.groupId}`}>
        <OrganizationGroupRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
