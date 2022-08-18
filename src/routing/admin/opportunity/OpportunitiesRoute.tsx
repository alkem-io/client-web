import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { OpportunityProvider } from '../../../context/OpportunityProvider/OpportunityProvider';
import { ChallengeSettingsLayoutHolder } from '../../../domain/admin/challenge/ChallengeSettingsLayoutWithOutlet';
import { Error404, PageProps } from '../../../pages';
import ChallengeOpportunitiesPage from '../../../pages/Admin/Challenge/ChallengeOpportunities/ChallengeOpportunitiesPage';
import { nameOfUrl } from '../../url-params';
import { OpportunityRoute } from './OpportunityRoute';

interface Props extends PageProps {}

export const OpportunitiesRoute: FC<Props> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Routes>
      <Route index element={<ChallengeOpportunitiesPage paths={currentPaths} routePrefix="../../" />} />
      <Route path="new" element={<ChallengeSettingsLayoutHolder />} />
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
