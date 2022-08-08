import React, { FC, useMemo } from 'react';
import OpportunityProjectsView from '../../views/Opportunity/OpportunityProjectsView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

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
