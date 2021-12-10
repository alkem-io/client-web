import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import CanvasActionsContainer from '../../containers/canvas/CanvasActionsContainer';
import { CanvasProvider } from '../../containers/canvas/CanvasProvider';
import { OpportunityPageFragment } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import CanvasManagementView from '../Canvas/CanvasManagementView';

export interface OpportunityContextViewEntities {
  opportunity: OpportunityPageFragment;
}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityCanvasManagementViewProps
  extends ViewProps<OpportunityContextViewEntities, undefined, OpportunityContextViewState, undefined> {}

const OpportunityCanvasManagementView: FC<OpportunityCanvasManagementViewProps> = ({ entities, state }) => {
  const { opportunity } = entities;
  const contextID = opportunity.context?.id || '';

  return (
    <CanvasProvider>
      {(canvasEntities, canvasState) => (
        <CanvasActionsContainer>
          {(_, __, actions) => (
            <CanvasManagementView
              entities={{
                ...canvasEntities,
                contextID,
              }}
              actions={actions}
              state={{
                ...canvasState,
                loadingCanvases: state.loading,
              }}
              options={{
                isEditable: true,
              }}
            />
          )}
        </CanvasActionsContainer>
      )}
    </CanvasProvider>
  );
};

export default OpportunityCanvasManagementView;
