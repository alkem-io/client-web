import { Route, Routes } from 'react-router-dom';
import VCProfilePage from './vcProfilePage/VCProfilePage';
import { Error404 } from '@/core/pages/Errors/Error404';
import VCSettingsRoute from '../virtualContributorAdmin/VCSettingsRoute';
import { nameOfUrl } from '@/main/routing/urlParams';
import VCKnowledgeBaseRoute from './knowledgeBase/VCKnowledgeBaseRoute';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';
import VCPageLayout from './layout/VCPageLayout';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';

export const VCRoute = () => {
  return (
    <Routes>
      <Route path={`:${nameOfUrl.vcNameId}/*`} element={<VCPageLayout />}>
        <Route index element={<VCProfilePage />} />
        <Route path={`${KNOWLEDGE_BASE_PATH}/*`} element={<VCKnowledgeBaseRoute />} />
        <Route
          path="settings/*"
          element={
            <NoIdentityRedirect>
              <VCSettingsRoute />
            </NoIdentityRedirect>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
export default VCRoute;
