import { nameOfUrl } from '@/main/routing/urlParams';
import { Route, Routes } from 'react-router-dom';
import VCProfilePage from '../vcProfilePage/VCProfilePage';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { buildCalloutOnVCKnowledgeBaseUrl } from '@/main/routing/urlBuilders';

export const VCKnowledgeBaseRoute = () => {
  const { vcNameId, calloutNameId } = useUrlParams();
  const parentPagePath = vcNameId && calloutNameId ? buildCalloutOnVCKnowledgeBaseUrl(vcNameId, calloutNameId) : '/';

  return (
    <Routes>
      <Route index element={<VCProfilePage openKnowledgeBaseDialog />} />
      <Route path={`/:${nameOfUrl.calloutNameId}`} element={<VCProfilePage openKnowledgeBaseDialog />} />
      <Route
        path={`/:${nameOfUrl.calloutNameId}/*`}
        element={<CalloutRoute parentPagePath={parentPagePath} journeyTypeName="knowledge-base" />}
      />
    </Routes>
  );
};

export default VCKnowledgeBaseRoute;
