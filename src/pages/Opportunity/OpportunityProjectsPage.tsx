import React, { FC, useMemo } from 'react';
import { OpportunityPageContainer } from '../../containers';
import OpportunityProjectsView from '../../views/Opportunity/OpportunityProjectsView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface OpportunityProjectsPageProps extends PageProps {}

const OpportunityProjectsPage: FC<OpportunityProjectsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/projects', name: 'projects', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Projects} entityTypeName="opportunity">
      <OpportunityPageContainer>
        {e => (
          <OpportunityProjectsView
            entities={{ opportunityProjects: e.opportunityProjects }}
            state={{}}
            actions={{}}
            options={{}}
          />
        )}
      </OpportunityPageContainer>
    </OpportunityPageLayout>
  );
};
export default OpportunityProjectsPage;
