import React, { FC } from 'react';
import WhiteboardRtActionsContainer from '../containers/WhiteboardRtActionsContainer';
import { AuthorizationPrivilege, WhiteboardRtDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import WhiteboardRtManagementView, {
  ActiveWhiteboardIdHolder,
  WhiteboardNavigationMethods,
} from './WhiteboardRtManagementView';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export interface WhiteboardsRtManagementViewWrapperProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  journeyTypeName: JourneyTypeName;
  whiteboard: WhiteboardRtDetailsFragment | undefined;
  calloutId: string | undefined;
  authorization: WhiteboardRtDetailsFragment['authorization'];
  whiteboardShareUrl: string;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
}

const WhiteboardsRtManagementViewWrapper: FC<WhiteboardsRtManagementViewWrapperProps> = ({
  whiteboardId,
  calloutId,
  whiteboard,
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

  // Todo: need to decide who can edit what whiteboards, for now tie to UpdateContent. May need to extend the information on a Whiteboard
  // to include who created it etc.
  // Also to have in mind: In SingleWhiteboard Callout whiteboards, users may not have CreateWhiteboard privilege to add another whiteboard but may have privilege
  // to update an existing whiteboard
  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
  const hasUpdateContentPrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateContent);

  return (
    <WhiteboardRtActionsContainer>
      {(_, actionsState, actions) => (
        <WhiteboardRtManagementView
          entities={{
            whiteboard,
            calloutId,
            whiteboardId,
            contextSource: journeyTypeName,
          }}
          actions={actions}
          state={{
            ...whiteboardsState,
            ...actionsState,
          }}
          options={{
            canUpdate: hasUpdatePrivileges,
            canUpdateContent: hasUpdateContentPrivileges,
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
