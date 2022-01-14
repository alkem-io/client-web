import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { OrganizationProvider } from '../../../context/OrganizationProvider';
import { EditMode } from '../../../models/editMode';
import { Error404, PageProps } from '../../../pages';
import { nameOfUrl } from '../../url-params';
import { OrganizationRoute } from './OrganizationRoute';

export const OrganizationsRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('./');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [paths]);

  return (
    <Routes>
      <Route>
        <OrganizationList paths={currentPaths} />
      </Route>
      <Route path={'new'}>
        <OrganizationPage title={'Create organization'} mode={EditMode.new} paths={currentPaths} />
      </Route>
      <Route path={`:${nameOfUrl.organizationNameId}`}>
        <OrganizationProvider>
          <OrganizationRoute paths={currentPaths} />
        </OrganizationProvider>
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
