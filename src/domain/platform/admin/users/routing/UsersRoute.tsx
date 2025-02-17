import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminUsersPage from '@/main/admin/users/adminUsers/AdminUsersPage';
import UserPage from '../pages/UserPage';
import { nameOfUrl } from '@/main/routing/urlParams';

export const UsersRoute = () => {
  return (
    <Routes>
      <Route index element={<AdminUsersPage />} />
      <Route path={`:${nameOfUrl.userNameId}/edit`} element={<UserPage />} />
      <Route path={`:${nameOfUrl.userNameId}`} element={<UserPage readOnly />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
