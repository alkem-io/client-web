import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminOpportunityCommunityPage from '@/domain/journey/opportunity/pages/AdminOpportunityCommunityPage';
import OpportunityCommunicationsPage from '@/domain/journey/opportunity/pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityAboutPage from '@/domain/journey/opportunity/pages/OpportunityAboutPage';
import OpportunitySettingsPage from '@/domain/journey/opportunity/pages/OpportunitySettings/OpportunitySettingsPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

export const OpportunityRoute = () => {
  const { subspace } = useSubSpace();
  const communityId = subspace.about.membership.communityID;

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={subspace?.id}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<OpportunityAboutPage />} />
          <Route path="communications" element={<OpportunityCommunicationsPage communityId={communityId} />} />
          <Route path="community" element={<AdminOpportunityCommunityPage />} />
          <Route path="settings" element={<OpportunitySettingsPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
