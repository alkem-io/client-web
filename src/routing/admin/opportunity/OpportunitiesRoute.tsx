import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import EditOpportunity from '../../../components/Admin/EditOpportunity';
import FormMode from '../../../components/Admin/FormMode';
import { OpportunityProvider } from '../../../context/OpportunityProvider/OpportunityProvider';
import { Error404, PageProps } from '../../../pages';
import ChallengeOpportunitiesPage from '../../../pages/Admin/Challenge/ChallengeOpportunities/ChallengeOpportunitiesPage';
import { nameOfUrl } from '../../url-params';
import { OpportunityRoute } from './OpportunityRoute';

interface Props extends PageProps {}

export const OpportunitiesRoute: FC<Props> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Routes>
      <Route index element={<ChallengeOpportunitiesPage paths={currentPaths} routePrefix="../../" />} />
      <Route
        path="new"
        element={
          <EditOpportunity
            title={t('navigation.admin.opportunity.create')}
            mode={FormMode.create}
            paths={currentPaths}
          />
        }
      />
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
