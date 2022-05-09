import React, { FC } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { CreateOrganizationGroupPage } from '../components/Organization/CreateOrganizationGroup';
import { Error404, PageProps } from '../../../pages';
import { nameOfUrl } from '../../../routing/url-params';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';
import { useAppendPaths } from '../../../hooks/usePathUtils';

export const OrganizationGroupsRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('..');
  const currentPaths = useAppendPaths(paths, { value: `${url}/community`, name: 'community' }, { name: 'groups' });

  return (
    <Routes>
      <Route path="new" element={<CreateOrganizationGroupPage paths={currentPaths} />} />
      <Route path={`:${nameOfUrl.groupId}/*`} element={<OrganizationGroupRoute paths={currentPaths} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
