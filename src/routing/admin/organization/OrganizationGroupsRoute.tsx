import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { CreateOrganizationGroupPage } from '../../../components/Admin/Organization/CreateOrganizationGroup';
import { Error404, PageProps } from '../../../pages';
import { OrganizationGroupsPage } from '../../../pages/Admin/Organization/OrganizationGroupsPage';
import { nameOfUrl } from '../../url-params';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';

export const OrganizationGroupsRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('./');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<OrganizationGroupsPage paths={currentPaths} />}></Route>
        <Route path={'new'} element={<CreateOrganizationGroupPage paths={currentPaths} />}></Route>
        <Route path={`:${nameOfUrl.groupId}`} element={<OrganizationGroupRoute paths={currentPaths} />}></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
