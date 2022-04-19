import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { OrganizationProvider } from '../../../context/OrganizationProvider';
import { EditMode } from '../../../models/editMode';
import { Error404, PageProps } from '../../../pages';
import { nameOfUrl } from '../../url-params';
import { OrganizationRoute } from '../../../domain/admin/organization/OrganizationRoute';
import AdminOrganizationsPage from '../../../pages/Admin/AdminOrganizations/AdminOrganizationsPage';

export const OrganizationsRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [paths]);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<AdminOrganizationsPage paths={currentPaths} />}></Route>
        <Route
          path={'new'}
          element={<OrganizationPage title={'Create organization'} mode={EditMode.new} paths={currentPaths} />}
        ></Route>
        <Route
          path={`:${nameOfUrl.organizationNameId}/*`}
          element={
            <OrganizationProvider>
              <OrganizationRoute paths={currentPaths} />
            </OrganizationProvider>
          }
        ></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
