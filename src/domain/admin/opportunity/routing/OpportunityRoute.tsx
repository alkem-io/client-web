import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useChallenge, useOpportunity } from '../../../../hooks';
import { PageProps, Error404 } from '../../../../pages';
import OpportunityCommunityAdminPage from '../OpportunityCommunityAdminPage';
import OpportunityCommunicationsPage from '../pages/OpportunityCommunications/OpportunityCommunicationsPage';
import OpportunityContextPage from '../pages/OpportunityContext/OpportunityContextPage';
import OpportunityProfilePage from '../pages/OpportunityProfile/OpportunityProfilePage';
import OpportunityAuthorizationRoute from './OpportunityAuthorizationRoute';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';

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
