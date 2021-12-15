import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation();

  return (
    <CanvasProvider>
      {(canvasEntities, canvasState) => (
        <CanvasActionsContainer>
          {(_, actionsState, actions) => (
            <CanvasManagementView
              entities={{
                ...canvasEntities,
                contextID,
                contextSource: 'opportunity',
                templateListHeader: t('pages.canvas.opportunity.templatesHeader'),
              }}
              actions={actions}
              state={{
                ...canvasState,
                ...actionsState,
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
