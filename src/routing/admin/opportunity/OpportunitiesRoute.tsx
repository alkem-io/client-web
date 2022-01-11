import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import EditOpportunity from '../../../components/Admin/EditOpportunity';
import FormMode from '../../../components/Admin/FormMode';
import { OpportunityProvider } from '../../../context/OpportunityProvider';
import { Error404, PageProps } from '../../../pages';
import OpportunityList from '../../../pages/Admin/Opportunity/OpportunityList';
import { nameOfUrl } from '../../url-params';
import { OpportunityRoute } from './OpportunityRoute';

interface Props extends PageProps {}

export const OpportunitiesRoute: FC<Props> = ({ paths }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Routes>
      <Route exact path={`${path}`}>
        <OpportunityList paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <EditOpportunity title={t('navigation.admin.opportunity.create')} mode={FormMode.create} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.opportunityNameId}`}>
        <OpportunityProvider>
          <OpportunityRoute paths={currentPaths} />
        </OpportunityProvider>
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
