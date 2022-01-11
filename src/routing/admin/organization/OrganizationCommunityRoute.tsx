import React, { FC } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { Error404, PageProps } from '../../../pages';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import { OrganizationMembersRoute } from './OrganizationMembersRoute';

export const OrganizationCommunityRoute: FC<PageProps> = ({ paths }) => {
  const { path } = useRouteMatch();

  return (
    <Routes>
      <Route path={`${path}/groups`}>
        <OrganizationGroupsRoute paths={paths} />
      </Route>
      <Route path={`${path}/members`}>
        <OrganizationMembersRoute paths={paths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
