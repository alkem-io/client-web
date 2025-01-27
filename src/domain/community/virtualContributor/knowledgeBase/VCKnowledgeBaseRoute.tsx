import { nameOfUrl } from '@/main/routing/urlParams';
import { Route, Routes } from 'react-router-dom';
import VCProfilePage from '../vcProfilePage/VCProfilePage';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { buildVCKnowledgeBaseUrl } from '@/main/routing/urlBuilders';

export const VCKnowledgeBaseRoute = () => {
  const { vcNameId } = useUrlParams();
  const parentPagePath = vcNameId ? buildVCKnowledgeBaseUrl(vcNameId) : '/';

  return (
    <Routes>
      <Route index element={<VCProfilePage openKnowledgeBaseDialog />} />
      <Route path={`/:${nameOfUrl.calloutNameId}`} element={<VCProfilePage openKnowledgeBaseDialog />} />
      <Route
        path={`/:${nameOfUrl.calloutNameId}/*`}
        element={
          <VCProfilePage openKnowledgeBaseDialog>
            <CalloutRoute parentPagePath={parentPagePath} journeyTypeName="knowledge-base" />
          </VCProfilePage>
        }
      />
    </Routes>
  );
};

export default VCKnowledgeBaseRoute;
