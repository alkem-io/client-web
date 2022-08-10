import React, { FC } from 'react';
import CanvasActionsContainer from '../../../containers/canvas/CanvasActionsContainer';
import { useConfig } from '../../../hooks';
import { FEATURE_COLLABORATION_CANVASES } from '../../../models/constants';
import {
  AuthorizationPrivilege,
  CanvasDetailsFragment,
  CollaborationWithCanvasDetailsFragment,
  CreateCanvasCanvasTemplateFragment,
} from '../../../models/graphql-schema';
import { Error404 } from '../../../pages';
import CanvasManagementView, {
  ActiveCanvasIdHolder,
  CanvasManagementViewEntities,
  CanvasNavigationMethods,
} from './CanvasManagementView';
import { EntityTypeName } from '../../shared/layout/PageLayout/PageLayout';
import Loading from '../../../components/core/Loading/Loading';

export interface CanvasesManagementViewWrapperProps extends ActiveCanvasIdHolder, CanvasNavigationMethods {
  entityTypeName: EntityTypeName;
  canvases: CanvasDetailsFragment[];
  templates: CreateCanvasCanvasTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithCanvasDetailsFragment['callouts']>[0]['authorization'];
  loadingCanvases: boolean;
  loadingTemplates: boolean;
}

const CanvasesManagementViewWrapper: FC<CanvasesManagementViewWrapperProps> = ({
  canvasId,
  calloutId,
  canvases,
  templates,
  authorization,
  entityTypeName,
  backToCanvases,
  buildLinkToCanvas,
  ...canvasesState
}) => {
  const { isFeatureEnabled } = useConfig();

  if (!calloutId) {
    return <Loading />;
  }

  const hasReadPrivileges =
    authorization?.anonymousReadAccess || authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPrivileges) return <Error404 />;

  const hasCreatePrivileges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.CreateCanvas);
  const hasDeletePrivileges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Delete);
  // Todo: need to decide who can edit what canvases, for now tie to CreateCanvas. May need to extend the information on a Canvas
  // to include who created it etc.
  const hasUpdatePrivileges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.CreateCanvas);

  return (
    <CanvasActionsContainer>
      {(_, actionsState, actions) => (
        <CanvasManagementView
          entities={{
            canvases,
            templates,
            calloutID: calloutId,
            canvasId,
            contextSource: entityTypeName as CanvasManagementViewEntities['contextSource'],
          }}
          actions={actions}
          state={{
            ...canvasesState,
            ...actionsState,
          }}
          options={{
            canUpdate: hasUpdatePrivileges,
            canCreate: hasCreatePrivileges,
            canDelete: hasDeletePrivileges,
          }}
          backToCanvases={backToCanvases}
          buildLinkToCanvas={buildLinkToCanvas}
        />
      )}
    </CanvasActionsContainer>
  );
};

export default CanvasesManagementViewWrapper;
