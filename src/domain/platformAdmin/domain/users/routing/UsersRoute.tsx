import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminUsersPage from '@/main/admin/users/adminUsers/AdminUsersPage';
import { nameOfUrl } from '@/main/routing/urlParams';
import UserPage from '../pages/UserPage';

export const UsersRoute = () => {
  return (
    <Routes>
      <Route index={true} element={<AdminUsersPage />} />
      <Route path={`:${nameOfUrl.userNameId}/edit`} element={<UserPage />} />
      <Route path={`:${nameOfUrl.userNameId}`} element={<UserPage readOnly={true} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
