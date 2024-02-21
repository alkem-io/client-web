import React, { FC } from 'react';
import WhiteboardActionsContainer from '../containers/WhiteboardActionsContainer';
import {
  AuthorizationPrivilege,
  WhiteboardContentFragment,
  WhiteboardDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import WhiteboardContentContainer from '../containers/WhiteboardContentContainer';
import WhiteboardDialog from '../WhiteboardDialog/WhiteboardRtDialog';
import { useFullscreen } from '../../../../core/ui/fullscreen/useFullscreen';
import FullscreenButton from '../../../../core/ui/button/FullscreenButton';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import { BlockTitle } from '../../../../core/ui/typography';
import useWhiteboardContentUpdatePolicy from '../contentUpdatePolicy/WhiteboardContentUpdatePolicy';
import WhiteboardShareSettings from '../share/WhiteboardShareSettings';

export interface ActiveWhiteboardIdHolder {
  whiteboardId?: string;
}
export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

export interface WhiteboardViewProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  journeyTypeName: JourneyTypeName;
  whiteboard: WhiteboardDetailsFragment | undefined;
  authorization: WhiteboardDetailsFragment['authorization'];
  whiteboardShareUrl: string;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
}

const WhiteboardView: FC<WhiteboardViewProps> = ({
  whiteboardId,
  whiteboard,
  authorization,
  journeyTypeName,
  backToWhiteboards,
  loadingWhiteboards,
  whiteboardShareUrl,
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

  const contentUpdatePolicyProvided = useWhiteboardContentUpdatePolicy({
    whiteboardId: whiteboard?.id,
    skip: !hasUpdatePrivileges,
  });

  return (
    <WhiteboardActionsContainer>
      {(_, actionsState, actions) => (
        <WhiteboardContentContainer whiteboardId={whiteboard?.id}>
          {entities => {
            return (
              <WhiteboardDialog
                entities={{
                  whiteboard: entities.whiteboard as WhiteboardContentFragment & WhiteboardDetailsFragment,
                }}
                actions={{
                  onCancel: handleCancel,
                  onUpdate: actions.onUpdate,
                }}
                options={{
                  canEdit: hasUpdateContentPrivileges,
                  show: Boolean(whiteboardId),
                  fixedDialogTitle:
                    hasUpdatePrivileges && !readOnlyDisplayName ? undefined : (
                      <BlockTitle display="flex" alignItems="center">
                        {whiteboard?.profile.displayName}
                      </BlockTitle>
                    ),
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
        </WhiteboardContentContainer>
      )}
    </WhiteboardActionsContainer>
  );
};

export default WhiteboardView;
