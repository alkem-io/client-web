import React, { FC } from 'react';
import CanvasActionsContainer from '../../../containers/canvas/CanvasActionsContainer';
import { useConfig } from '../../../hooks';
import { FEATURE_COLLABORATION_CANVASES } from '../../../models/constants';
import {
  AuthorizationPrivilege,
  CanvasDetailsFragment,
  ContextWithCanvasDetailsFragment,
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
  contextId: string | undefined;
  authorization: ContextWithCanvasDetailsFragment['authorization'];
  loadingCanvases: boolean;
  loadingTemplates: boolean;
}

const CanvasesManagementViewWrapper: FC<CanvasesManagementViewWrapperProps> = ({
  canvasId,
  contextId,
  canvases,
  templates,
  authorization,
  entityTypeName,
  backToCanvases,
  buildLinkToCanvas,
  ...canvasesState
}) => {
  const { isFeatureEnabled } = useConfig();

  if (!contextId) {
    return <Loading />;
  }

  const hasReadPriviliges =
    authorization?.anonymousReadAccess || authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPriviliges) return <Error404 />;

  const hasCreatePriviliges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.CreateCanvas);
  const hasDeletePriviliges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Delete);
  // Todo: need to decide who can edit what canvases, for now tie to CreateCanvas. May need to extend the information on a Canvas
  // to include who created it etc.
  const hasUpdatePriviliges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.CreateCanvas);

  return (
    <CanvasActionsContainer>
      {(_, actionsState, actions) => (
        <CanvasManagementView
          entities={{
            canvases,
            templates,
            contextID: contextId,
            canvasId,
            contextSource: entityTypeName as CanvasManagementViewEntities['contextSource'],
          }}
          actions={actions}
          state={{
            ...canvasesState,
            ...actionsState,
          }}
          options={{
            canUpdate: hasUpdatePriviliges,
            canCreate: hasCreatePriviliges,
            canDelete: hasDeletePriviliges,
          }}
          backToCanvases={backToCanvases}
          buildLinkToCanvas={buildLinkToCanvas}
        />
      )}
    </CanvasActionsContainer>
  );
};

export default CanvasesManagementViewWrapper;
