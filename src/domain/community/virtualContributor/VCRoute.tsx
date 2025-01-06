import { Route, Routes } from 'react-router-dom';
import VCProfilePage from './vcProfilePage/VCProfilePage';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import VCSettingsRoute from '../virtualContributorAdmin/VCSettingsRoute';
import { nameOfUrl } from '@/main/routing/urlParams';

export const VCRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.vcNameId}/*`}>
      <Route path="" element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<VCProfilePage />} />
      </Route>
      <Route path="settings/*" element={<VCSettingsRoute />} />
    </Route>
    <Route
      path="*"
      element={
        <TopLevelLayout>
          <Error404 />
        </TopLevelLayout>
      }
    />
  </Routes>
);

export default VCRoute;
