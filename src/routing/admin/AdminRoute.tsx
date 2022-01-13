import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { managementData } from '../../components/Admin/managementData';
import { useTransactionScope } from '../../hooks';
import { Error404 } from '../../pages';
import ManagementPageTemplatePage from '../../pages/Admin/ManagementPageTemplatePage';
import { EcoversesRoute } from './ecoverse/EcoversesRoute';
import GlobalAuthorizationRoute from './GlobalAuthorizationRoute';
import { OrganizationsRoute } from './organization/OrganizationsRoute';
import { UsersRoute } from './users/UsersRoute';

export const AdminRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const url = '';
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={<ManagementPageTemplatePage data={managementData.adminLvl} paths={currentPaths} />}
        ></Route>
        <Route path={'users'} element={<UsersRoute paths={currentPaths} />}></Route>
        <Route path={'authorization'} element={<GlobalAuthorizationRoute paths={currentPaths} />}></Route>
        <Route path={'hubs'} element={<EcoversesRoute paths={currentPaths} />}></Route>
        <Route path={'organizations'} element={<OrganizationsRoute paths={currentPaths} />}></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
