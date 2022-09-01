import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { EditMode } from '../../../../models/editMode';
import { Error404, PageProps } from '../../../../pages';
import AdminUsersPage from '../AdminUsers/AdminUsersPage';
import { UserPage } from '../pages/UserPage';
import { nameOfUrl } from '../../../../routing/url-params';

export const UsersRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'users', real: true }], [paths]);

  return (
    <Routes>
      <Route index element={<AdminUsersPage paths={currentPaths} />} />
      {/* creating users is disabled */}
      {/* <Route path={`new`}>
      <UserPage mode={EditMode.new} paths={currentPaths} title="New user" />
    </Route> */}
      <Route path={`:${nameOfUrl.userNameId}/edit`} element={<UserPage paths={currentPaths} mode={EditMode.edit} />} />
      <Route path={`:${nameOfUrl.userNameId}`} element={<UserPage paths={currentPaths} mode={EditMode.readOnly} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
