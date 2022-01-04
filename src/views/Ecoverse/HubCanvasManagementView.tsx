import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasActionsContainer from '../../containers/canvas/CanvasActionsContainer';
import { CanvasProvider } from '../../containers/canvas/CanvasProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COLLABORATION_CANVASES } from '../../models/constants';
import { AuthorizationPrivilege, EcoversePageFragment } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { Error404 } from '../../pages';
import CanvasManagementView from '../Canvas/CanvasManagementView';

export interface HubContextViewEntities {
  hub: EcoversePageFragment;
}

export interface HubContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface HubCanvasManagementViewProps
  extends ViewProps<HubContextViewEntities, undefined, HubContextViewState, undefined> {}

const HubCanvasManagementView: FC<HubCanvasManagementViewProps> = ({ entities, state }) => {
  const { hub } = entities;
  const contextID = hub.context?.id || '';

  const { t } = useTranslation();

  const { isFeatureEnabled } = useConfig();

  const hasReadPriviliges =
    hub.context?.authorization?.anonymousReadAccess ||
    hub.context?.authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPriviliges) return <Error404 />;

  const hasCreatePriviliges = hub.context?.authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Create);
  const hasDeletePriviliges = hub.context?.authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Delete);
  const hasUpdatePriviliges = hub.context?.authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Update);

  return (
    <CanvasProvider>
      {(canvasEntities, canvasState) => (
        <CanvasActionsContainer>
          {(_, actionsState, actions) => (
            <CanvasManagementView
              entities={{
                ...canvasEntities,
                contextID,
                contextSource: 'hub',
                templateListHeader: t('pages.canvas.hub.templatesHeader'),
                templateListSubheader: t('pages.canvas.hub.templatesHeader'),
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

export default HubCanvasManagementView;
