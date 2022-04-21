import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useChallenge, useOpportunity } from '../../../hooks';
import { Error404, PageProps } from '../../../pages';
import CommunityGroupsRoute from '../../../domain/admin/community/routes/CommunityGroupsAdminRoutes';
import OpportunityAuthorizationRoute from './OpportunityAuthorizationRoute';
import OpportunityCommunityAdminPage from '../../../domain/admin/opportunity/OpportunityCommunityAdminPage';
import OpportunityProfilePage from '../../../pages/Admin/Opportunity/OpportunityProfile/OpportunityProfilePage';
import OpportunityCommunicationsPage from '../../../pages/Admin/Opportunity/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../../../pages/Admin/Opportunity/OpportunityContext/OpportunityContextPage';

interface Props extends PageProps {}

export const OpportunityRoute: FC<Props> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { challenge } = useChallenge();
  const { opportunity, displayName } = useOpportunity();

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
      <Route path="community" element={<OpportunityCommunityAdminPage paths={currentPaths} />} />
      <Route
        path="community/groups/*"
        element={
          <CommunityGroupsRoute
            paths={currentPaths}
            communityId={opportunity?.community?.id}
            parentCommunityId={challenge?.community?.id}
          />
        }
      />
      <Route path="authorization/*" element={<OpportunityAuthorizationRoute paths={currentPaths} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
