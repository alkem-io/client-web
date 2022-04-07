import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useChallenge, useOpportunity } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import { CommunityRoute } from '../community';
import OpportunityAuthorizationRoute from './OpportunityAuthorizationRoute';
import OpportunityCommunityPage from '../../../pages/Admin/Opportunity/OpportunityCommunity/OpportunityCommunityPage';
import OpportunityProfilePage from '../../../pages/Admin/Opportunity/OpportunityProfile/OpportunityProfilePage';
import OpportunityCommunicationsPage from '../../../pages/Admin/Opportunity/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../../../pages/Admin/Opportunity/OpportunityContext/OpportunityContextPage';

interface Props extends PageProps {}

export const OpportunityRoute: FC<Props> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { challenge } = useChallenge();
  const { opportunity, opportunityId, displayName } = useOpportunity();

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName || '', real: true }],
    [paths, displayName, url]
  );

  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<OpportunityProfilePage paths={currentPaths} />} />
      <Route path="context" element={<OpportunityContextPage paths={currentPaths} />} />
      <Route
        path="communications"
        element={
          <OpportunityCommunicationsPage
            communityId={opportunity?.community?.id}
            parentCommunityId={challenge?.community?.id}
            paths={currentPaths}
          />
        }
      />
      <Route path="community" element={<OpportunityCommunityPage paths={currentPaths} />} />
      <Route
        path="community/*"
        element={
          <CommunityRoute
            paths={currentPaths}
            communityId={opportunity?.community?.id}
            parentCommunityId={challenge?.community?.id}
            credential={AuthorizationCredential.OpportunityMember}
            resourceId={opportunityId}
            accessedFrom="opportunity"
          />
        }
      />
      <Route path="authorization/*" element={<OpportunityAuthorizationRoute paths={currentPaths} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
