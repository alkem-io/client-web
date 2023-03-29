import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../../core/routing/urlParams';
import AdminInnovationPacksPage from './AdminInnovationPacksPage';

const AdminInnovationPacksRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationPacksPage />} />
        <Route path="new" element={<AdminInnovationPacksPage dialog="new" />} />
        <Route path={`:${nameOfUrl.innovationPackNameId}/*`} element={<p>Hola</p>} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminInnovationPacksRoutes;
