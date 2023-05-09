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
import UrlParams from '../../../../core/routing/urlParams';
import { buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

export interface CanvasesManagementViewWrapperProps extends ActiveCanvasIdHolder, CanvasNavigationMethods {
  journeyTypeName: JourneyTypeName;
  canvas: CanvasDetailsFragment | undefined;
  templates: CreateCanvasWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithCanvasDetailsFragment['callouts']>[0]['authorization'];
  overrideCanvasUrl?: string;
  loadingCanvases: boolean;
  loadingTemplates: boolean;
}

const buildCanvasShareUrl = (urlParams: UrlParams) => {
  if (!urlParams.hubNameId || !urlParams.calloutNameId || !urlParams.whiteboardNameId) return;

  return buildCanvasUrl(urlParams.calloutNameId, urlParams.whiteboardNameId, {
    hubNameId: urlParams.hubNameId,
    challengeNameId: urlParams.challengeNameId,
    opportunityNameId: urlParams.opportunityNameId,
  });
};

const CanvasesManagementViewWrapper: FC<CanvasesManagementViewWrapperProps> = ({
  canvasNameId,
  calloutId,
  canvas,
  templates,
  authorization,
  journeyTypeName,
  backToCanvases,
  loadingCanvases,
  overrideCanvasUrl,
  ...canvasesState
}) => {
  const urlParams = useUrlParams();
  const canvasShareUrl = overrideCanvasUrl ? overrideCanvasUrl : buildCanvasShareUrl(urlParams);

  const { isFeatureEnabled } = useConfig();
  if (!calloutId) {
    return null;
  }
  const hasReadPrivileges =
    authorization?.anonymousReadAccess || authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!loadingCanvases && (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPrivileges))
    return <Error404 />;

  const hasCreatePrivileges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.CreateCanvas);
  const hasDeletePrivileges = authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Delete);
  // Todo: need to decide who can edit what canvases, for now tie to CreateCanvas. May need to extend the information on a Canvas
  // to include who created it etc.
  // Also to have in mind: In SingleCallout canvases, users don't have CreateCanvas privilege to add another canvas but may have privilege
  // to update the canvas itself
  const hasUpdatePrivileges = authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.CreateCanvas || p === AuthorizationPrivilege.Update
  );

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
