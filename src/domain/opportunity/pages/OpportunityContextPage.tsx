import React, { FC, useMemo } from 'react';
import ContextTabContainer from '../../../containers/context/ContextTabContainer';
import { useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import { useOpportunity } from '../hooks/useOpportunity';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import OpportunityContextView from '../views/OpportunityContextView';

export interface OpportunityContextPageProps extends PageProps {}

const OpportunityContextPage: FC<OpportunityContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { hubNameId, opportunityNameId, displayName } = useOpportunity();

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.About}>
      <ContextTabContainer hubNameId={hubNameId} opportunityNameId={opportunityNameId}>
        {(entities, state) => (
          <OpportunityContextView
            entities={{
              opportunityDisplayName: displayName,
              opportunityTagset: entities.tagset,
              opportunityLifecycle: entities.lifecycle,
              context: entities.context,
            }}
            state={{
              loading: state.loading,
              error: state.error,
            }}
            options={{}}
            actions={{}}
            activity={entities.activity}
          />
        )}
      </ContextTabContainer>
    </OpportunityPageLayout>
  );
};
export default OpportunityContextPage;
