import { Route, Routes } from 'react-router-dom';
import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import { buildVCKnowledgeBaseUrl } from '@/main/routing/urlBuilders';
import { nameOfUrl } from '@/main/routing/urlParams';
import VCProfilePage from '../vcProfilePage/VCProfilePage';
import { virtualContributorsCalloutRestrictions } from './virtualContributorsCalloutRestrictions';

export const VCKnowledgeBaseRoute = () => {
  return (
    <Routes>
      <Route index={true} element={<VCProfilePage openKnowledgeBaseDialog={true} />} />
      <Route
        path={`/:${nameOfUrl.calloutNameId}/*`}
        element={
          <VCProfilePage openKnowledgeBaseDialog={true}>
            {(vc?: { profile?: { url: string } }) => (
              <CalloutPage
                parentRoute={buildVCKnowledgeBaseUrl(vc?.profile?.url)}
                renderPage={() => <></>}
                disableCalloutsClassification={true}
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
