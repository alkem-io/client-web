import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import HubLandingPage from '../HubLandingPage/HubLandingPage';
import InnovationHubSettingsPage from '../InnovationHubsSettings/InnovationHubSettingsPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';

const HubRoute = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route path={`:${nameOfUrl.innovationHubNameId}`} element={<HubLandingPage />} />
      <Route path={`:${nameOfUrl.innovationHubNameId}/settings`} element={<InnovationHubSettingsPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  </StorageConfigContextProvider>
);

export default HubRoute;
