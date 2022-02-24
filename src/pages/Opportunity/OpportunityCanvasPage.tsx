import React, { FC, useMemo } from 'react';
import { OpportunityPageContainer } from '../../containers';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import OpportunityCanvasView from '../../views/Opportunity/OpportunityCanvasManagementView';

export interface OpportunityCanvasPageProps extends PageProps {}

const OpportunityCanvasPage: FC<OpportunityCanvasPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
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
  );
};
export default OpportunityCanvasPage;
