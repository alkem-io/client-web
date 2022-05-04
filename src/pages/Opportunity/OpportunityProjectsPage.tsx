import React, { FC, useMemo } from 'react';
import { OpportunityPageContainer } from '../../containers';
import OpportunityProjectsView from '../../views/Opportunity/OpportunityProjectsView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import PageLayout from '../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface OpportunityProjectsPageProps extends PageProps {}

const OpportunityProjectsPage: FC<OpportunityProjectsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/projects', name: 'projects', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <PageLayout currentSection={EntityPageSection.Projects} entityTypeName="opportunity">
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
    </PageLayout>
  );
};
export default OpportunityProjectsPage;
