import { nameOfUrl } from '@/main/routing/urlParams';
import { Route, Routes } from 'react-router-dom';
import VCProfilePage from '../vcProfilePage/VCProfilePage';
import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import { buildVCKnowledgeBaseUrl } from '@/main/routing/urlBuilders';
import { virtualContributorsCalloutRestrictions } from './virtualContributorsCalloutRestrictions';

export const VCKnowledgeBaseRoute = () => {
  return (
    <Routes>
      <Route index element={<VCProfilePage openKnowledgeBaseDialog />} />
      <Route
        path={`/:${nameOfUrl.calloutNameId}/*`}
        element={
          <VCProfilePage openKnowledgeBaseDialog>
            {(vc?: { profile: { url: string } }) => (
              <CalloutPage
                parentRoute={buildVCKnowledgeBaseUrl(vc?.profile.url)}
                renderPage={() => <></>}
                disableCalloutsClassification
                calloutRestrictions={virtualContributorsCalloutRestrictions}
              />
            )}
          </VCProfilePage>
        }
      />
    </Routes>
  );
};

export default VCKnowledgeBaseRoute;
