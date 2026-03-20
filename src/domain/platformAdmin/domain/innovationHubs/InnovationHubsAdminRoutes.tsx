import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import AdminInnovationHubsPage from './AdminInnovationHubsPage';

const AdminInnovationHubsRoutes = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route path="/">
        <Route index={true} element={<AdminInnovationHubsPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  </StorageConfigContextProvider>
);

export default AdminInnovationHubsRoutes;
