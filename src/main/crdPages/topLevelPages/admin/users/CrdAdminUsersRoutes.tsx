import { Route, Routes } from 'react-router-dom';
import CrdAdminUserPage from './CrdAdminUserPage';
import CrdAdminUsersPage from './CrdAdminUsersPage';

/**
 * Routes the Users admin section: list (index) and detail/edit (`:userId/edit`).
 */
export const CrdAdminUsersRoutes = () => (
  <Routes>
    <Route index={true} element={<CrdAdminUsersPage />} />
    <Route path=":userId/edit" element={<CrdAdminUserPage />} />
  </Routes>
);

export default CrdAdminUsersRoutes;
