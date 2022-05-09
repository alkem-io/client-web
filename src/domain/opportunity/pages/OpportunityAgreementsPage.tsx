import React, { FC, useMemo } from 'react';
import { PageProps } from '../../../pages/common';
import { useUpdateNavigation } from '../../../hooks';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import OpportunityProjectsView from '../views/OpportunityProjectsView';

export interface OpportunityProjectsPageProps extends PageProps {}

const OpportunityAgreementsPage: FC<OpportunityProjectsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/projects', name: 'projects', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Agreements}>
      <OpportunityProjectsView />
    </OpportunityPageLayout>
  );
};
export default OpportunityAgreementsPage;
