import { Route, Routes } from 'react-router-dom';
import VCProfilePage from './vcProfilePage/VCProfilePage';
import { PageLayoutHolderWithOutlet } from '@/domain/space/layout/EntityPageLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import VCSettingsRoute from '../virtualContributorAdmin/VCSettingsRoute';
import { nameOfUrl } from '@/main/routing/urlParams';
import VCKnowledgeBaseRoute from './knowledgeBase/VCKnowledgeBaseRoute';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';

export const VCRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.vcNameId}/*`} element={<PageLayoutHolderWithOutlet />}>
      <Route index element={<VCProfilePage />} />
      <Route path={`${KNOWLEDGE_BASE_PATH}/*`} element={<VCKnowledgeBaseRoute />} />
      <Route path="settings/*" element={<VCSettingsRoute />} />
      <Route path="*" element={<Error404 />} />
    </Route>
  </Routes>
);

export default VCRoute;
