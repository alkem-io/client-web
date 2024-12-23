import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CreateOrganizationGroupPage } from '../../platform/admin/components/Organization/CreateOrganizationGroup';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import { OrganizationGroupRoute } from './OrganizationGroupRoute';

export const OrganizationGroupsRoute: FC = () => {
  return (
    <Routes>
      <Route path="new" element={<CreateOrganizationGroupPage />} />
      <Route path={`:${nameOfUrl.groupId}/*`} element={<OrganizationGroupRoute />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
