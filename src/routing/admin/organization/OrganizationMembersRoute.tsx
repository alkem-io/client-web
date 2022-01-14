import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404, PageProps } from '../../../pages';
import OrganizationCommunityPage from '../../../pages/Admin/Organization/OrganizationCommunityPage';

export const OrganizationMembersRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('./');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: true }], [paths, url]);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<OrganizationCommunityPage paths={currentPaths} />}></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
