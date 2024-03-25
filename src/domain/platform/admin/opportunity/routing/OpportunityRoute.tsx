import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useChallenge } from '../../../../journey/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../../journey/opportunity/hooks/useOpportunity';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import AdminOpportunityCommunityPage from '../../../../journey/opportunity/pages/AdminOpportunityCommunityPage';
import OpportunityCommunicationsPage from '../pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../pages/OpportunityContext/OpportunityContextPage';
import OpportunityProfilePage from '../pages/OpportunityProfile/OpportunityProfilePage';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';

export const OpportunityRoute: FC = () => {
  const { challenge } = useChallenge();
  const { opportunity } = useOpportunity();

  return (
    <StorageConfigContextProvider locationType="journey" journeyTypeName="opportunity" journeyId={opportunity?.id}>
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<OpportunityProfilePage />} />
        <Route path="context" element={<OpportunityContextPage />} />
        <Route
          path="communications"
          element={
            <OpportunityCommunicationsPage
              communityId={opportunity?.community?.id}
              parentCommunityId={challenge?.community?.id}
            />
          }
        />
        <Route path="community" element={<AdminOpportunityCommunityPage />} />
        <Route
          path="community/groups/*"
          element={
            <CommunityGroupsRoute
              communityId={opportunity?.community?.id}
              parentCommunityId={challenge?.community?.id}
            />
          }
        />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};
