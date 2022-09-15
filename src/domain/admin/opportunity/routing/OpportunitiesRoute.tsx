import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import EditOpportunity from '../../components/EditOpportunity';
import FormMode from '../../components/FormMode';
import { OpportunityProvider } from '../../../opportunity/context/OpportunityProvider';
import ChallengeSettingsLayout from '../../challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../layout/EntitySettings/constants';
import { Error404, PageProps } from '../../../../pages';
import { nameOfUrl } from '../../../../routing/url-params';
import { OpportunityRoute } from './OpportunityRoute';
import ChallengeOpportunitiesPage from '../../../challenge/pages/ChallengeOpportunities/ChallengeOpportunitiesPage';

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
          <ChallengeSettingsLayout currentTab={SettingsSection.Opportunities} tabRoutePrefix={'../../'}>
            <EditOpportunity
              title={t('navigation.admin.opportunity.create')}
              mode={FormMode.create}
              paths={currentPaths}
            />
          </ChallengeSettingsLayout>
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
