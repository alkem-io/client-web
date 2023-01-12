import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useChallenge } from '../../../../challenge/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../../challenge/opportunity/hooks/useOpportunity';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import OpportunityCommunityAdminPage from '../OpportunityCommunityAdminPage';
import OpportunityCommunicationsPage from '../pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../pages/OpportunityContext/OpportunityContextPage';
import OpportunityProfilePage from '../pages/OpportunityProfile/OpportunityProfilePage';
import OpportunityAuthorizationRoute from './OpportunityAuthorizationRoute';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import OpportunityInnovationFlowPage from '../pages/InnovationFlow/OpportunityInnovationFlowPage';

export const OpportunityRoute: FC = () => {
  const { challenge } = useChallenge();
  const { opportunity } = useOpportunity();

  return (
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
      <Route path="community" element={<OpportunityCommunityAdminPage />} />
      <Route
        path="community/groups/*"
        element={
          <CommunityGroupsRoute communityId={opportunity?.community?.id} parentCommunityId={challenge?.community?.id} />
        }
      />
      <Route path="authorization/*" element={<OpportunityAuthorizationRoute />} />
      <Route path="innovation-flow/*" element={<OpportunityInnovationFlowPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
