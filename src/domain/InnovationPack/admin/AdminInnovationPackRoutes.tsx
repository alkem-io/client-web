import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@core/pages/Errors/Error404';
import AdminInnovationPacksPage from './AdminInnovationPacksPage';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';

const AdminInnovationPacksRoutes: FC = () => {
  return (
    <StorageConfigContextProvider locationType="platform">
      <Routes>
        <Route path="/">
          <Route index element={<AdminInnovationPacksPage />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default AdminInnovationPacksRoutes;
