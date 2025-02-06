import { ReactNode } from 'react';
import WhiteboardActionsContainer from '../containers/WhiteboardActionsContainer';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { CalloutsSetParentType, KnowledgeBaseCalloutsSetType } from '@/domain/journey/JourneyTypeName';
import WhiteboardDialog, { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import useWhiteboardContentUpdatePolicy from '../contentUpdatePolicy/WhiteboardContentUpdatePolicy';
import WhiteboardShareSettings from '../share/WhiteboardShareSettings';

export interface ActiveWhiteboardIdHolder {
  whiteboardId?: string;
}
export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

export interface WhiteboardViewProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  journeyTypeName: CalloutsSetParentType;
  whiteboard: WhiteboardDetails | undefined;
  authorization: { myPrivileges?: AuthorizationPrivilege[] } | undefined;
  whiteboardShareUrl: string;
  displayName?: ReactNode;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
  preventWhiteboardDeletion?: boolean; // TODO: Temporary solution to avoid single-whiteboard callouts to lose their whiteboard
}

const WhiteboardView = ({
  whiteboardId,
  whiteboard,
  authorization,
  journeyTypeName,
  backToWhiteboards,
  loadingWhiteboards,
  whiteboardShareUrl,
  displayName,
  readOnlyDisplayName,
  preventWhiteboardDeletion,
  ...whiteboardsState
}: WhiteboardViewProps) => {
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
  const hasDeletePrivileges =
    !preventWhiteboardDeletion && authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete);

  const contentUpdatePolicyProvided = useWhiteboardContentUpdatePolicy({
    whiteboardId: whiteboard?.id,
    skip: !hasUpdatePrivileges,
  });

  return (
    // @@@ WIP ~ #7611
    <WhiteboardActionsContainer>
      {(_, actionsState, actions) => (
        // @@@ WIP ~ #7611
        <WhiteboardDialog
          entities={{
            whiteboard,
          }}
          actions={{
            onCancel: handleCancel,
            onUpdate: actions.onUpdate,
            onDelete: actions.onDelete,
            onChangeDisplayName: actions.onChangeDisplayName,
          }}
          options={{
            canEdit: hasUpdateContentPrivileges,
            canDelete: hasDeletePrivileges,
            show: Boolean(whiteboardId),
            dialogTitle: displayName,
            readOnlyDisplayName: readOnlyDisplayName || !hasUpdatePrivileges,
            fullscreen,
            headerActions: journeyTypeName !== KnowledgeBaseCalloutsSetType && (
              <>
                <ShareButton url={whiteboardShareUrl} entityTypeName="whiteboard" disabled={!whiteboardShareUrl}>
                  {hasUpdatePrivileges && (
                    <WhiteboardShareSettings
                      createdBy={whiteboard?.createdBy}
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
      )}
    </WhiteboardActionsContainer>
  );
};

export default WhiteboardView;
