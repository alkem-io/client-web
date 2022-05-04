import PageLayout from '../../domain/shared/layout/PageLayout';

import React, { FC, useMemo } from 'react';
import { OpportunityPageContainer } from '../../containers';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import OpportunityCanvasView from '../../views/Opportunity/OpportunityCanvasManagementView';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface OpportunityCanvasPageProps extends PageProps {}

const OpportunityCanvasPage: FC<OpportunityCanvasPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <PageLayout currentSection={EntityPageSection.Canvases} entityTypeName="opportunity">
      <OpportunityPageContainer>
        {(entities, state) => (
          <OpportunityCanvasView
            entities={entities}
            state={{
              loading: state.loading,
              error: state.error,
            }}
            actions={undefined}
            options={undefined}
          />
        )}
      </OpportunityPageContainer>
    </PageLayout>
  );
};
export default OpportunityCanvasPage;
