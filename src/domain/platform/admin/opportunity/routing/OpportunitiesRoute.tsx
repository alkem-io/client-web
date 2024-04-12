import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { OpportunityProvider } from '../../../../journey/opportunity/context/OpportunityProvider';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../main/routing/urlParams';
import { OpportunityRoute } from './OpportunityRoute';
import ChallengeOpportunitiesPage from '../../../../journey/subspace/pages/SubspaceSubspaces/SubspaceSubspacesPage';

export const OpportunitiesRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<ChallengeOpportunitiesPage routePrefix="../../" />} />
      <Route
        path={`:${nameOfUrl.subsubspaceNameId}/*`}
        element={
          <OpportunityProvider>
            <OpportunityRoute />
          </OpportunityProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
