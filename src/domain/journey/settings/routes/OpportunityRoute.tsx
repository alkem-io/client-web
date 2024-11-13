import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '../../subspace/hooks/useSubSpace';
import { Error404 } from '@core/pages/Errors/Error404';
import AdminOpportunityCommunityPage from '../../opportunity/pages/AdminOpportunityCommunityPage';
import OpportunityCommunicationsPage from '../../../platform/admin/opportunity/pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../../../platform/admin/opportunity/pages/OpportunityContext/OpportunityContextPage';
import OpportunityProfilePage from '../../../platform/admin/opportunity/pages/OpportunityProfile/OpportunityProfilePage';
import CommunityGroupsRoute from '../../../platform/admin/community/routes/CommunityGroupsAdminRoutes';
import OpportunitySettingsPage from '../../../platform/admin/opportunity/pages/OpportunitySettings/OpportunitySettingsPage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

interface OpportunityRouteProps {
  parentCommunityId: string | undefined;
}

export const OpportunityRoute = ({ parentCommunityId }: OpportunityRouteProps) => {
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
          <Route
            path="community/groups/*"
            element={
              <CommunityGroupsRoute communityId={subspace?.community?.id} parentCommunityId={parentCommunityId} />
            }
          />
          <Route path="settings" element={<OpportunitySettingsPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
