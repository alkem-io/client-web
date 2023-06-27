import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../../core/pages/Errors/Error404';
import AdminInnovationPacksPage from './AdminInnovationPacksPage';
import AdminNewInnovationPackPage from './AdminNewInnovationPackPage';

const AdminInnovationPacksRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationPacksPage />} />
        <Route path="new" element={<AdminNewInnovationPackPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminInnovationPacksRoutes;
