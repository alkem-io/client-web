import React, { FC, useMemo } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { OrganizationProvider } from '../../../context/OrganizationProvider';
import { EditMode } from '../../../models/editMode';
import { Error404, PageProps } from '../../../pages';
import { nameOfUrl } from '../../url-params';
import { OrganizationRoute } from './OrganizationRoute';

export const OrganizationsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [paths]);

  return (
    <Routes>
      <Route exact path={`${path}`}>
        <OrganizationList paths={currentPaths} />
      </Route>
      <Route path={`${path}/new`}>
        <OrganizationPage title={'Create organization'} mode={EditMode.new} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.organizationNameId}`}>
        <OrganizationProvider>
          <OrganizationRoute paths={currentPaths} />
        </OrganizationProvider>
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
