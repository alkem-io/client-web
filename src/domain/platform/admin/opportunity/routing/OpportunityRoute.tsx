import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '../../../../journey/subspace/hooks/useChallenge';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import AdminOpportunityCommunityPage from '../../../../journey/opportunity/pages/AdminOpportunityCommunityPage';
import OpportunityCommunicationsPage from '../pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../pages/OpportunityContext/OpportunityContextPage';
import OpportunityProfilePage from '../pages/OpportunityProfile/OpportunityProfilePage';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';

interface OpportunityRouteProps {
  parentCommunityId: string | undefined;
}

export const OpportunityRoute = ({ parentCommunityId }: OpportunityRouteProps) => {
  const { subspace } = useSubSpace();

  return (
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
          element={<CommunityGroupsRoute communityId={subspace?.community?.id} parentCommunityId={parentCommunityId} />}
        />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};
