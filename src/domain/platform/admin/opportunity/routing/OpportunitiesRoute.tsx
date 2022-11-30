import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { OpportunityProvider } from '../../../../challenge/opportunity/context/OpportunityProvider';
import { PageProps } from '../../../../shared/types/PageProps';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../core/routing/url-params';
import { OpportunityRoute } from './OpportunityRoute';
import ChallengeOpportunitiesPage from '../../../../challenge/challenge/pages/ChallengeOpportunities/ChallengeOpportunitiesPage';

interface Props extends PageProps {}

export const OpportunitiesRoute: FC<Props> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths, url]);

  return (
    <Routes>
      <Route index element={<ChallengeOpportunitiesPage paths={currentPaths} routePrefix="../../" />} />
      <Route
        path={`:${nameOfUrl.opportunityNameId}/*`}
        element={
          <OpportunityProvider>
            <OpportunityRoute paths={currentPaths} />
          </OpportunityProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
