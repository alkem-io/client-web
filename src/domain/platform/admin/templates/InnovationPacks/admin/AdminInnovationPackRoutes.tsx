import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../../core/routing/urlParams';
import AdminInnovationPackPage from './AdminInnovationPackPage';
import AdminInnovationPacksPage from './AdminInnovationPacksPage';

const AdminInnovationPacksRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationPacksPage />} />
        <Route path="new" element={<AdminInnovationPackPage isNew />} />
        <Route path={`:${nameOfUrl.innovationPackNameId}/*`} element={<AdminInnovationPackPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminInnovationPacksRoutes;
