import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import EditOpportunity from '../../../components/Admin/EditOpportunity';
import FormMode from '../../../components/Admin/FormMode';
import { OpportunityProvider } from '../../../context/OpportunityProvider/OpportunityProvider';
import { Error404, PageProps } from '../../../pages';
import OpportunityList from '../../../pages/Admin/Opportunity/OpportunityList';
import { nameOfUrl } from '../../url-params';
import { OpportunityRoute } from './OpportunityRoute';

interface Props extends PageProps {}

export const OpportunitiesRoute: FC<Props> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<OpportunityList paths={currentPaths} />} />
        <Route
          path={'new'}
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
      </Route>
    </Routes>
  );
};
