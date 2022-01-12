import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CreateOrganizationGroupPage } from '../../../components/Admin/Organization/CreateOrganizationGroup';
import { Error404, PageProps } from '../../../pages';
import { OrganizationGroupsPage } from '../../../pages/Admin/Organization/OrganizationGroupsPage';
import { nameOfUrl } from '../../url-params';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';

export const OrganizationGroupsRoute: FC<PageProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  return (
    <Routes>
      <Route>
        <OrganizationGroupsPage paths={currentPaths} />
      </Route>
      <Route path={'new'}>
        <CreateOrganizationGroupPage paths={currentPaths} />
      </Route>
      <Route path={`:${nameOfUrl.groupId}`}>
        <OrganizationGroupRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
