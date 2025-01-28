import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminOpportunityCommunityPage from '@/domain/journey/opportunity/pages/AdminOpportunityCommunityPage';
import OpportunityCommunicationsPage from '@/domain/platform/admin/opportunity/pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '@/domain/platform/admin/opportunity/pages/OpportunityContext/OpportunityContextPage';
import OpportunityProfilePage from '@/domain/platform/admin/opportunity/pages/OpportunityProfile/OpportunityProfilePage';
import OpportunitySettingsPage from '@/domain/platform/admin/opportunity/pages/OpportunitySettings/OpportunitySettingsPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

export const OpportunityRoute = () => {
  const { subspace } = useSubSpace();

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={subspace?.id}>
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<OpportunityProfilePage />} />
          <Route path="context" element={<OpportunityContextPage />} />
          <Route
            path="communications"
            element={<OpportunityCommunicationsPage communityId={subspace?.community?.id} />}
          />
          <Route path="community" element={<AdminOpportunityCommunityPage />} />
          <Route path="settings" element={<OpportunitySettingsPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
