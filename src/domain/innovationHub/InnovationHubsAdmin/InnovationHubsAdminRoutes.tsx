import { Route, Routes } from 'react-router-dom';

import AdminInnovationHubPage from './AdminInnovationHubPage';
import { Error404 } from '../../../core/pages/Errors/Error404';
import AdminInnovationHubsPage from './AdminInnovationHubsPage';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';

import { nameOfUrl } from '../../../main/routing/urlParams';

const AdminInnovationHubsRoutes = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route path="/">
        <Route index element={<AdminInnovationHubsPage />} />
        <Route path={`:${nameOfUrl.innovationHubNameId}`} element={<AdminInnovationHubPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  </StorageConfigContextProvider>
);

export default AdminInnovationHubsRoutes;
