import React, { FC } from 'react';
import WhiteboardActionsContainer from '../containers/WhiteboardActionsContainer';
import {
  AuthorizationPrivilege,
  WhiteboardDetailsFragment,
  CollaborationWithWhiteboardDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import WhiteboardManagementView, {
  ActiveWhiteboardIdHolder,
  WhiteboardNavigationMethods,
} from './WhiteboardManagementView';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export interface WhiteboardsManagementViewWrapperProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  journeyTypeName: JourneyTypeName;
  whiteboard: WhiteboardDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: NonNullable<CollaborationWithWhiteboardDetailsFragment['callouts']>[0]['authorization'];
  whiteboardShareUrl: string;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
  loadingTemplates: boolean;
  updatePrivilege?: AuthorizationPrivilege;
}

const WhiteboardsManagementViewWrapper: FC<WhiteboardsManagementViewWrapperProps> = ({
  whiteboardNameId,
  calloutId,
  whiteboard,
  templates,
  authorization,
  journeyTypeName,
  backToWhiteboards,
  loadingWhiteboards,
  whiteboardShareUrl,
  readOnlyDisplayName,
  ...whiteboardsState
}) => {
  if (!calloutId) {
    return null;
  }
  const hasCreatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateWhiteboard);
  const hasDeletePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete);

  // Todo: need to decide who can edit what whiteboards, for now tie to CreateWhiteboard. May need to extend the information on a Whiteboard
  // to include who created it etc.
  // Also to have in mind: In SingleWhiteboard Callout whiteboards, users don't have CreateWhiteboard privilege to add another whiteboard but may have privilege
  // to update the whiteboard itself
  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateContent);

  return (
    <WhiteboardActionsContainer>
      {(_, actionsState, actions) => (
        <WhiteboardManagementView
          entities={{
            whiteboard,
            templates,
            calloutId,
            whiteboardNameId,
            contextSource: journeyTypeName,
          }}
          actions={actions}
          state={{
            ...whiteboardsState,
            ...actionsState,
          }}
          options={{
            canUpdate: hasUpdatePrivileges,
            canUpdateDisplayName: hasUpdatePrivileges && !readOnlyDisplayName,
            canCreate: hasCreatePrivileges,
            canDelete: hasDeletePrivileges,
            shareUrl: whiteboardShareUrl,
          }}
          backToWhiteboards={backToWhiteboards}
        />
      )}
    </WhiteboardActionsContainer>
  );
};

export default WhiteboardsManagementViewWrapper;
