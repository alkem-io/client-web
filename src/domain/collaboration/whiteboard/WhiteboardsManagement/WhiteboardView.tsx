import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { Divider } from '@mui/material';
import { useState, useEffect, ReactNode } from 'react';
import WhiteboardDialog, { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import WhiteboardActionsContainer from '../containers/WhiteboardActionsContainer';
import CollaborationSettings from '../../realTimeCollaboration/CollaborationSettings/CollaborationSettings';
import { SaveRequestIndicatorIcon } from '@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon';
import { useWhiteboardLastUpdatedDateQuery } from '@/core/apollo/generated/apollo-hooks';
import WhiteboardPreviewSettingsButton from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsButton';
import { CollabState } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import { gutters } from '@/core/ui/grid/utils';
import WhiteboardGuestAccessControls from '../WhiteboardShareDialog/WhiteboardGuestAccessControls';
import WhiteboardGuestAccessSection from '../WhiteboardShareDialog/WhiteboardGuestAccessSection';

export interface ActiveWhiteboardIdHolder {
  whiteboardId?: string;
}
export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

export interface WhiteboardViewProps extends ActiveWhiteboardIdHolder, WhiteboardNavigationMethods {
  whiteboard: WhiteboardDetails | undefined;
  authorization: { myPrivileges?: AuthorizationPrivilege[] } | undefined;
  whiteboardShareUrl: string;
  displayName?: ReactNode;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
  preventWhiteboardDeletion?: boolean; // TODO: Temporary solution to avoid single-whiteboard callouts to lose their whiteboard
  onWhiteboardDeleted?: () => void;
}

const WhiteboardView = ({
  whiteboardId,
  whiteboard,
  authorization,
  backToWhiteboards,
  loadingWhiteboards,
  whiteboardShareUrl,
  displayName,
  readOnlyDisplayName,
  preventWhiteboardDeletion,
  onWhiteboardDeleted,
  ...whiteboardsState
}: WhiteboardViewProps) => {
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState<number>(0);
  const [lastSuccessfulSavedDate, setLastSuccessfulSavedDate] = useState<Date | undefined>(undefined);
  const [previewSettingsDialogOpen, setPreviewSettingsDialogOpen] = useState<boolean>(false);

  const { fullscreen, setFullscreen } = useFullscreen();

  const {
    guestAccessEnabled,
    canToggle: canToggleGuestAccess,
    isMutating: isGuestAccessMutating,
    toggleGuestAccess,
    error: guestAccessError,
    resetError: resetGuestAccessError,
  } = useWhiteboardGuestAccess({
    whiteboardId,
    guestContributionsAllowed: whiteboard?.guestContributionsAllowed,
    authorization,
  });

  const guestShareLink = guestAccessEnabled ? buildGuestShareUrl() : undefined;

  const shareDialogGuestAccess = useMemo<ShareDialogGuestAccessState | undefined>(
    () =>
      whiteboard
        ? {
            enabled: guestAccessEnabled,
            canToggle: canToggleGuestAccess,
            isMutating: isGuestAccessMutating,
            onToggle: toggleGuestAccess,
            guestLink: guestShareLink,
            error: guestAccessError,
            resetError: resetGuestAccessError,
          }
        : undefined,
    [
      whiteboard,
      guestAccessEnabled,
      canToggleGuestAccess,
      isGuestAccessMutating,
      toggleGuestAccess,
      guestShareLink,
      guestAccessError,
      resetGuestAccessError,
    ]
  );

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
  const hasPublicSharePrivilege =
    whiteboard?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.PublicShare) ?? false;

  const { data: lastSaved } = useWhiteboardLastUpdatedDateQuery({
    variables: { whiteboardId: whiteboard?.id! },
    skip: !whiteboard?.id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // on the initialization of lastSuccessfulSavedDate take the date from the database
    if (!lastSuccessfulSavedDate && lastSaved?.lookup.whiteboard?.updatedDate) {
      setLastSuccessfulSavedDate(new Date(lastSaved?.lookup.whiteboard?.updatedDate));
    }
  }, [lastSuccessfulSavedDate, lastSaved?.lookup.whiteboard?.updatedDate]);

  return (
    <WhiteboardActionsContainer>
      {({ state: actionsState, actions }) => (
        <WhiteboardDialog
          entities={{ whiteboard }}
          lastSuccessfulSavedDate={lastSuccessfulSavedDate}
          actions={{
            onCancel: handleCancel,
            setConsecutiveSaveErrors,
            onUpdate: actions.onUpdate,
            onDelete: async () => {
              await actions.onDelete(whiteboard!);
              onWhiteboardDeleted?.();
            },
            setLastSuccessfulSavedDate,
            onChangeDisplayName: actions.onChangeDisplayName,
            onClosePreviewSettingsDialog: () => setPreviewSettingsDialogOpen(false),
          }}
          options={{
            canEdit: hasUpdateContentPrivileges,
            canDelete: hasDeletePrivileges,
            show: Boolean(whiteboardId),
            dialogTitle: displayName,
            readOnlyDisplayName: readOnlyDisplayName || !hasUpdatePrivileges,
            fullscreen,
            previewSettingsDialogOpen: previewSettingsDialogOpen,
            headerActions: (collabState: CollabState) => (
              <>
                <ShareButton url={whiteboardShareUrl} entityTypeName="whiteboard" disabled={!whiteboardShareUrl}>
                  <WhiteboardGuestAccessControls whiteboard={whiteboard}>
                    <WhiteboardGuestAccessSection whiteboard={whiteboard} />
                  </WhiteboardGuestAccessControls>
                  {hasUpdatePrivileges && (
                    <>
                      {hasPublicSharePrivilege && (
                        <Divider orientation="horizontal" flexItem sx={{ marginTop: gutters(1) }} />
                      )}
                      <CollaborationSettings element={whiteboard} elementType="whiteboard" />
                    </>
                  )}
                </ShareButton>

                <FullscreenButton />

                <SaveRequestIndicatorIcon isSaved={consecutiveSaveErrors < 6} date={lastSuccessfulSavedDate} />

                {hasUpdatePrivileges && collabState.mode === 'write' && (
                  <WhiteboardPreviewSettingsButton onClick={() => setPreviewSettingsDialogOpen(true)} />
                )}
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
