import React, { FC, useMemo } from 'react';
import { OpportunityContainerEntities } from '../../containers';
import OpportunityProjectsView from '../../views/Opportunity/OpportunityProjectsView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

export interface OpportunityProjectsPageProps extends PageProps {
  entities: OpportunityContainerEntities;
}

const OpportunityProjectsPage: FC<OpportunityProjectsPageProps> = ({ paths, entities }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/projects', name: 'projects', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OpportunityProjectsView
      entities={{ opportunityProjects: entities.opportunityProjects }}
      state={{}}
      actions={{}}
      options={{}}
    />
  );
};
export default OpportunityProjectsPage;
