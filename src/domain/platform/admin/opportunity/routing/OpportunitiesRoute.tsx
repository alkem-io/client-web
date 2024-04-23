import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { OpportunityProvider } from '../../../../journey/opportunity/context/OpportunityProvider';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../main/routing/urlParams';
import { OpportunityRoute } from './OpportunityRoute';
import ChallengeOpportunitiesPage from '../../../../journey/challenge/pages/ChallengeOpportunities/ChallengeOpportunitiesPage';

export const OpportunitiesRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<ChallengeOpportunitiesPage routePrefix="../../" />} />
      <Route
        path={`:${nameOfUrl.opportunityNameId}/*`}
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
