import { Route, Routes } from 'react-router-dom';
import CrdAdminOrganizationFormPage from './CrdAdminOrganizationFormPage';
import CrdAdminOrganizationsPage from './CrdAdminOrganizationsPage';

/**
 * Routes the Organizations admin section: list (index), create (`new`), and
 * edit (`:orgId/edit`).
 */
export const CrdAdminOrganizationsRoutes = () => (
  <Routes>
    <Route index={true} element={<CrdAdminOrganizationsPage />} />
    <Route path="new" element={<CrdAdminOrganizationFormPage />} />
    <Route path=":orgId/edit" element={<CrdAdminOrganizationFormPage />} />
  </Routes>
);

export default CrdAdminOrganizationsRoutes;
