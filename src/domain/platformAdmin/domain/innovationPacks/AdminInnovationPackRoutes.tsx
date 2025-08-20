import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminInnovationPacksPage from './AdminInnovationPacksPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';

const AdminInnovationPacksRoutes = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationPacksPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  </StorageConfigContextProvider>
);

export default AdminInnovationPacksRoutes;
