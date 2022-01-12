import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
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
  const url = '';

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Routes>
      <Route>
        <OpportunityList paths={currentPaths} />
      </Route>
      <Route path={'new'}>
        <EditOpportunity title={t('navigation.admin.opportunity.create')} mode={FormMode.create} paths={currentPaths} />
      </Route>
      <Route path={`:${nameOfUrl.opportunityNameId}`}>
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
