import React, { FC } from 'react';
import CanvasActionsContainer from '../containers/CanvasActionsContainer';
import { useConfig } from '../../../platform/config/useConfig';
import { FEATURE_COLLABORATION_CANVASES } from '../../../platform/config/features.constants';
import {
  AuthorizationPrivilege,
  CanvasDetailsFragment,
  CollaborationWithCanvasDetailsFragment,
  CreateCanvasWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import CanvasManagementView, { ActiveCanvasIdHolder, CanvasNavigationMethods } from './CanvasManagementView';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

export interface CanvasesManagementViewWrapperProps extends ActiveCanvasIdHolder, CanvasNavigationMethods {
  journeyTypeName: JourneyTypeName;
  canvas: CanvasDetailsFragment | undefined;
  templates: CreateCanvasWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithCanvasDetailsFragment['callouts']>[0]['authorization'];
  canvasShareUrl: string;
  readOnlyDisplayName?: boolean;
  loadingCanvases: boolean;
  loadingTemplates: boolean;
  updatePrivilege?: AuthorizationPrivilege;
}

const CanvasesManagementViewWrapper: FC<CanvasesManagementViewWrapperProps> = ({
  canvasNameId,
  calloutId,
  canvas,
  templates,
  authorization,
  journeyTypeName,
  backToCanvases,
  loadingCanvases,
  canvasShareUrl,
  readOnlyDisplayName,
  updatePrivilege = AuthorizationPrivilege.CreateCanvas,
  ...canvasesState
}) => {
  const { isFeatureEnabled } = useConfig();

  if (!calloutId) {
    return null;
  }
  const hasReadPrivileges =
    authorization?.anonymousReadAccess || authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!loadingCanvases && (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPrivileges))
    return <Error404 />;

  const hasCreatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCanvas);
  const hasDeletePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete);
  // Todo: need to decide who can edit what canvases, for now tie to CreateCanvas. May need to extend the information on a Canvas
  // to include who created it etc.
  // Also to have in mind: In SingleWhiteboard Callout canvases, users don't have CreateCanvas privilege to add another canvas but may have privilege
  // to update the canvas itself
  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(updatePrivilege);

  return (
    <CanvasActionsContainer>
      {(_, actionsState, actions) => (
        <CanvasManagementView
          entities={{
            canvas,
            templates,
            calloutId,
            canvasNameId,
            contextSource: journeyTypeName,
          }}
          actions={actions}
          state={{
            ...canvasesState,
            ...actionsState,
          }}
          options={{
            canUpdate: hasUpdatePrivileges,
            canUpdateDisplayName: hasUpdatePrivileges && !readOnlyDisplayName,
            canCreate: hasCreatePrivileges,
            canDelete: hasDeletePrivileges,
            shareUrl: canvasShareUrl,
          }}
          backToCanvases={backToCanvases}
        />
      )}
    </CanvasActionsContainer>
  );
};

export default CanvasesManagementViewWrapper;
