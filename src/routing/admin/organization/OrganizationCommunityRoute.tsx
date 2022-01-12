import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404, PageProps } from '../../../pages';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import { OrganizationMembersRoute } from './OrganizationMembersRoute';

export const OrganizationCommunityRoute: FC<PageProps> = ({ paths }) => {
  return (
    <Routes>
      <Route path={'groups'}>
        <OrganizationGroupsRoute paths={paths} />
      </Route>
      <Route path={'members'}>
        <OrganizationMembersRoute paths={paths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
