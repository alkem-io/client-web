import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import InnovationHubSettingsPage from './InnovationHubSettingsPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { nameOfUrl } from '@/main/routing/urlParams';

const InnovationHubsRoutes = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route path="/">
        <Route path={`:${nameOfUrl.innovationHubNameId}/settings`} element={<InnovationHubSettingsPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  </StorageConfigContextProvider>
);

export default InnovationHubsRoutes;
