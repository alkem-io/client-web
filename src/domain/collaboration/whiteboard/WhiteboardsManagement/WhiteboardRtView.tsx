import React, { FC, ReactNode } from 'react';
import WhiteboardRtActionsContainer from '../containers/WhiteboardRtActionsContainer';
import {
  AuthorizationPrivilege,
  WhiteboardRtContentFragment,
  WhiteboardRtDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import WhiteboardRtContentContainer from '../containers/WhiteboardRtContentContainer';
import WhiteboardRtDialog from '../WhiteboardDialog/WhiteboardRtDialog';
import { useFullscreen } from '../../../../core/ui/fullscreen/useFullscreen';
import FullscreenButton from '../../../../core/ui/button/FullscreenButton';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import useWhiteboardRtContentUpdatePolicy from '../whiteboardRt/contentUpdatePolicy/WhiteboardRtContentUpdatePolicy';
import WhiteboardShareSettings from '../share/WhiteboardShareSettings';

export interface ActiveWhiteboardIdHolder {
  whiteboardId?: string;
}
export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

export interface WhiteboardRtViewProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  journeyTypeName: JourneyTypeName;
  whiteboard: WhiteboardRtDetailsFragment | undefined;
  authorization: WhiteboardRtDetailsFragment['authorization'];
  whiteboardShareUrl: string;
  displayName?: ReactNode;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
}

const WhiteboardRtView: FC<WhiteboardRtViewProps> = ({
  whiteboardId,
  whiteboard,
  authorization,
  journeyTypeName,
  backToWhiteboards,
  loadingWhiteboards,
  whiteboardShareUrl,
  displayName,
  readOnlyDisplayName,
  ...whiteboardsState
}) => {
  const { fullscreen, setFullscreen } = useFullscreen();

  const handleCancel = () => {
    backToWhiteboards();
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  // Todo: need to decide who can edit what whiteboards, for now tie to UpdateContent. May need to extend the information on a Whiteboard
  // to include who created it etc.
  // Also to have in mind: In SingleWhiteboard Callout whiteboards, users may not have CreateWhiteboard privilege to add another whiteboard but may have privilege
  // to update an existing whiteboard
  const hasUpdatePrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
  const hasUpdateContentPrivileges = authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateContent);

  const contentUpdatePolicyProvided = useWhiteboardRtContentUpdatePolicy({
    whiteboardId: whiteboard?.id,
    skip: !hasUpdatePrivileges,
  });

  return (
    <WhiteboardRtActionsContainer>
      {(_, actionsState, actions) => (
        <WhiteboardRtContentContainer whiteboardId={whiteboard?.id}>
          {entities => {
            return (
              <WhiteboardRtDialog
                entities={{
                  whiteboard: entities.whiteboard as WhiteboardRtContentFragment & WhiteboardRtDetailsFragment,
                }}
                actions={{
                  onCancel: handleCancel,
                  onUpdate: actions.onUpdate,
                }}
                options={{
                  canEdit: hasUpdateContentPrivileges,
                  show: Boolean(whiteboardId),
                  dialogTitle: displayName,
                  readOnlyDisplayName: readOnlyDisplayName || !hasUpdatePrivileges,
                  fullscreen,
                  headerActions: (
                    <>
                      <ShareButton url={whiteboardShareUrl} entityTypeName="whiteboard" disabled={!whiteboardShareUrl}>
                        {hasUpdatePrivileges && (
                          <WhiteboardShareSettings
                            createdBy={entities.whiteboard?.createdBy}
                            journeyTypeName={journeyTypeName}
                            {...contentUpdatePolicyProvided}
                          />
                        )}
                      </ShareButton>
                      <FullscreenButton />
                    </>
                  ),
                }}
                state={{
                  ...whiteboardsState,
                  ...actionsState,
                }}
              />
            );
          }}
        </WhiteboardRtContentContainer>
      )}
    </WhiteboardRtActionsContainer>
  );
};

export default WhiteboardRtView;
