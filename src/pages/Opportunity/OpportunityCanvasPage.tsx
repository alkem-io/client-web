import React, { FC, useMemo } from 'react';
import { OpportunityContainerEntities, OpportunityContainerState } from '../../containers';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import OpportunityCanvasView from '../../views/Opportunity/OpportunityCanvasManagementView';

export interface OpportunityCanvasPageProps extends PageProps {
  entities: OpportunityContainerEntities;
  state: OpportunityContainerState;
}

const OpportunityCanvasPage: FC<OpportunityCanvasPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OpportunityCanvasView
      entities={entities}
      state={{
        loading: state.loading,
        error: state.error,
      }}
      actions={undefined}
      options={undefined}
    />
  );
};
export default OpportunityCanvasPage;
