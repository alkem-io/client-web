import { Route, Routes } from 'react-router-dom';
import CrdOrganizationFormPage from '../../organizationPages/form/CrdOrganizationFormPage';
import CrdAdminOrganizationsPage from './CrdAdminOrganizationsPage';

const ADMIN_ORGANIZATIONS_URL = '/admin/organizations';

/**
 * Routes the Organizations admin section: list (index), create (`new`), and
 * edit (`:orgId/edit`). The form page returns to the admin list on cancel/edit.
 * Non-admin creation uses `CreateOrganizationDialog` (user settings), not a route.
 */
export const CrdAdminOrganizationsRoutes = () => (
  <Routes>
    <Route index={true} element={<CrdAdminOrganizationsPage />} />
    <Route path="new" element={<CrdOrganizationFormPage returnUrl={ADMIN_ORGANIZATIONS_URL} />} />
    <Route path=":orgId/edit" element={<CrdOrganizationFormPage returnUrl={ADMIN_ORGANIZATIONS_URL} />} />
  </Routes>
);

export default CrdAdminOrganizationsRoutes;
