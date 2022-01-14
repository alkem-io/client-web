import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404, PageProps } from '../../../pages';
import OrganizationCommunityPage from '../../../pages/Admin/Organization/OrganizationCommunityPage';

export const OrganizationMembersRoute: FC<PageProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: true }], [paths, url]);

  return (
    <Routes>
      <Route>
        <OrganizationCommunityPage paths={currentPaths} />
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
