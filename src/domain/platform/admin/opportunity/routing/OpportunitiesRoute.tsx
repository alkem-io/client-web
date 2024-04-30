import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { OpportunityProvider } from '../../../../journey/opportunity/context/OpportunityProvider';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../main/routing/urlParams';
import { OpportunityRoute } from './OpportunityRoute';
import ChallengeOpportunitiesPage from '../../../../journey/subspace/pages/SubspaceSubspaces/SubspaceSubspacesPage';
import SubspaceProvider from '../../../../journey/subspace/context/SubspaceProvider';

interface OpportunitiesRouteProps {
  parentCommunityId: string | undefined;
}

export const OpportunitiesRoute = ({ parentCommunityId }: OpportunitiesRouteProps) => {
  return (
    <Routes>
      <Route index element={<ChallengeOpportunitiesPage routePrefix="../../" />} />
      <Route
        path={`:${nameOfUrl.subsubspaceNameId}/*`}
        element={
          <SubspaceProvider>
            <OpportunityProvider>
              <OpportunityRoute parentCommunityId={parentCommunityId} />
            </OpportunityProvider>
          </SubspaceProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
