import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';
import { nameOfUrl } from '@/main/routing/urlParams';
import VCSettingsRoute from '../virtualContributorAdmin/VCSettingsRoute';
import VCKnowledgeBaseRoute from './knowledgeBase/VCKnowledgeBaseRoute';
import VCPageLayout from './layout/VCPageLayout';
import VCProfilePage from './vcProfilePage/VCProfilePage';

export const VCRoute = () => {
  return (
    <Routes>
      <Route path={`:${nameOfUrl.vcNameId}/*`} element={<VCPageLayout />}>
        <Route index={true} element={<VCProfilePage />} />
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
