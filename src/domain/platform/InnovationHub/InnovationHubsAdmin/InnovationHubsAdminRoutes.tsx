import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import AdminInnovationHubsPage from './AdminInnovationHubsPage';
import AdminNewInnovationHubPage from './AdminNewInnovationHubPage';
import { nameOfUrl } from '../../../../core/routing/urlParams';

const AdminInnovationHubsRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationHubsPage />} />
        <Route path="new" element={<AdminNewInnovationHubPage />} />
        <Route path={`:${nameOfUrl.innovationHubNameId}`} element={<AdminNewInnovationHubPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminInnovationHubsRoutes;
