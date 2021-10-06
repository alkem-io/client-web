import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour, PageProps } from '../../../pages';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import { OrganizationMembersRoute } from './OrganizationMembersRoute';

export const OrganizationCommunityRoute: FC<PageProps> = ({ paths }) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/groups`}>
        <OrganizationGroupsRoute paths={paths} />
      </Route>
      <Route path={`${path}/members`}>
        <OrganizationMembersRoute paths={paths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
