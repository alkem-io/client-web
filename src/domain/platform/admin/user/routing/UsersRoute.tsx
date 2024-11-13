import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { EditMode } from '@core/ui/forms/editMode';
import { Error404 } from '@core/pages/Errors/Error404';
import AdminUsersPage from '@main/admin/users/adminUsers/AdminUsersPage';
import UserPage from '../pages/UserPage';
import { nameOfUrl } from '@main/routing/urlParams';

export const UsersRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<AdminUsersPage />} />
      {/* creating users is disabled */}
      {/* <Route path={`new`}>
      <UserPage mode={EditMode.new} paths={currentPaths} title="New user" />
    </Route> */}
      <Route path={`:${nameOfUrl.userNameId}/edit`} element={<UserPage mode={EditMode.edit} />} />
      <Route path={`:${nameOfUrl.userNameId}`} element={<UserPage mode={EditMode.readOnly} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
