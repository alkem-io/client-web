import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import InnovationHubSettingsPage from './InnovationHubSettingsPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { nameOfUrl } from '@/main/routing/urlParams';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

const InnovationHubsRoutes = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route path="/" element={<PageLayoutHolderWithOutlet />}>
        <Route path={`:${nameOfUrl.innovationHubNameId}/settings`} element={<InnovationHubSettingsPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  </StorageConfigContextProvider>
);

export default withUrlResolverParams(InnovationHubsRoutes);
