import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasActionsContainer from '../../containers/canvas/CanvasActionsContainer';
import { CanvasProvider } from '../../containers/canvas/CanvasProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COLLABORATION_CANVASES } from '../../models/constants';
import { AuthorizationPrivilege, OpportunityPageFragment } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { Error404 } from '../../pages';
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

  const { isFeatureEnabled } = useConfig();
  const hasReadPriviliges =
    opportunity.context?.authorization?.anonymousReadAccess ||
    opportunity.context?.authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPriviliges) return <Error404 />;

  const hasCreatePriviliges = opportunity.context?.authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.Create
  );
  const hasDeletePriviliges = opportunity.context?.authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.Delete
  );
  const hasUpdatePriviliges = opportunity.context?.authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.Update
  );

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
                canUpdate: hasUpdatePriviliges,
                canCreate: hasCreatePriviliges,
                canDelete: hasDeletePriviliges,
              }}
            />
          )}
        </CanvasActionsContainer>
      )}
    </CanvasProvider>
  );
};

export default OpportunityCanvasManagementView;
