import React, { FC } from 'react';
import WhiteboardRtActionsContainer from '../containers/WhiteboardRtActionsContainer';
import {
  AuthorizationPrivilege,
  WhiteboardRtDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import WhiteboardRtManagementView, {
  ActiveWhiteboardIdHolder,
  WhiteboardNavigationMethods,
} from './WhiteboardRtManagementView';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export interface WhiteboardsRtManagementViewWrapperProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  journeyTypeName: JourneyTypeName;
  whiteboard: WhiteboardRtDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  calloutId: string | undefined;
  authorization: WhiteboardRtDetailsFragment['authorization'];
  whiteboardShareUrl: string;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
  loadingTemplates: boolean;
}

const WhiteboardsRtManagementViewWrapper: FC<WhiteboardsRtManagementViewWrapperProps> = ({
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

  // Todo: need to make a difference between seeing a whiteboard contents read only + being able to update it.

  // Todo: need to decide who can edit what whiteboards, for now tie to CreateWhiteboard. May need to extend the information on a Whiteboard
  // to include who created it etc.
  // Also to have in mind: In SingleWhiteboard Callout whiteboards, users don't have CreateWhiteboard privilege to add another whiteboard but may have privilege
  // to update the whiteboard itself
  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateContent);

  return (
    <WhiteboardRtActionsContainer>
      {(_, actionsState, actions) => (
        <WhiteboardRtManagementView
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
            shareUrl: whiteboardShareUrl,
          }}
          backToWhiteboards={backToWhiteboards}
        />
      )}
    </WhiteboardRtActionsContainer>
  );
};

export default WhiteboardsRtManagementViewWrapper;
