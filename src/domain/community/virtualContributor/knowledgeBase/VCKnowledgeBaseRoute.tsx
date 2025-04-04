import { nameOfUrl } from '@/main/routing/urlParams';
import { Route, Routes } from 'react-router-dom';
import VCProfilePage from '../vcProfilePage/VCProfilePage';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import { buildVCKnowledgeBaseUrl } from '@/main/routing/urlBuilders';

export const VCKnowledgeBaseRoute = () => {
  return (
    <Routes>
      <Route index element={<VCProfilePage openKnowledgeBaseDialog />} />
      <Route
        path={`/:${nameOfUrl.calloutNameId}`}
        element={
          <VCProfilePage openKnowledgeBaseDialog>
            {(vc?: { profile: { url: string } }) => (
              <CalloutPage
                parentRoute={buildVCKnowledgeBaseUrl(vc?.profile.url)}
                renderPage={() => <></>}
                disableCalloutsClassification
              />
            )}
          </VCProfilePage>
        }
      />
      <Route
        path={`/:${nameOfUrl.calloutNameId}/*`}
        element={
          <VCProfilePage openKnowledgeBaseDialog>
            {(vc?: { profile: { url: string } }) => (
              <CalloutRoute parentPagePath={buildVCKnowledgeBaseUrl(vc?.profile.url)} />
            )}
          </VCProfilePage>
        }
      />
    </Routes>
  );
};

export default VCKnowledgeBaseRoute;
