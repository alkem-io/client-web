import { nameOfUrl } from '@/main/routing/urlParams';
import { Route, Routes } from 'react-router-dom';
import VCProfilePage from '../vcProfilePage/VCProfilePage';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';

export const VCKnowledgeBaseRoute = () => (
  <Routes>
    <Route index element={<VCProfilePage openKnowledgeBaseDialog />} />
    <Route path={`/:${nameOfUrl.calloutNameId}`} element={<VCProfilePage openKnowledgeBaseDialog />} />
    <Route
      path={`/:${nameOfUrl.calloutNameId}/*`}
      element={<CalloutRoute parentPagePath={'/'} journeyTypeName="knowledge-base" />}
    />
  </Routes>
);

export default VCKnowledgeBaseRoute;
