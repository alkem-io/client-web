import { Divider } from '@mui/material';
import { type ReactNode, useState } from 'react';
import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { SaveRequestIndicatorIcon } from '@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon';
import type { CollabState } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import CollaborationSettings from '../../realTimeCollaboration/CollaborationSettings/CollaborationSettings';
import WhiteboardDialog, { type WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import WhiteboardPreviewSettingsButton from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsButton';
import WhiteboardGuestAccessControls from '../WhiteboardShareDialog/WhiteboardGuestAccessControls';
import WhiteboardGuestAccessSection from '../WhiteboardShareDialog/WhiteboardGuestAccessSection';
import { useWhiteboardViewState } from './useWhiteboardViewState';

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
  guestShareUrl?: string;
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
  guestShareUrl,
  displayName,
  readOnlyDisplayName,
  preventWhiteboardDeletion,
  onWhiteboardDeleted,
  ...whiteboardsState
}: WhiteboardViewProps) => {
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState<number>(0);
  const [previewSettingsDialogOpen, setPreviewSettingsDialogOpen] = useState<boolean>(false);

  const {
    lastSuccessfulSavedDate,
    setLastSuccessfulSavedDate,
    hasUpdatePrivileges,
    hasUpdateContentPrivileges,
    hasDeletePrivileges,
    hasPublicSharePrivilege,
    guestAccess,
    actionsState,
    actions,
  } = useWhiteboardViewState({ whiteboard, authorization, guestShareUrl, preventWhiteboardDeletion });

  const { fullscreen, setFullscreen } = useFullscreen();
  const { isSmallScreen } = useScreenSize();

  const isFullscreen = fullscreen || isSmallScreen;

  const handleCancel = () => {
    backToWhiteboards();
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  return (
    <WhiteboardDialog
      entities={{ whiteboard }}
      lastSuccessfulSavedDate={lastSuccessfulSavedDate}
      actions={{
        onCancel: handleCancel,
        setConsecutiveSaveErrors,
        onUpdate: actions.onUpdate,
        onDelete: async () => {
          if (!whiteboard) return;
          await actions.onDelete(whiteboard);
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
        fullscreen: isFullscreen,
        previewSettingsDialogOpen: previewSettingsDialogOpen,
        headerActions: (collabState: CollabState) => (
          <>
            <ShareButton url={whiteboardShareUrl} entityTypeName="whiteboard" disabled={!whiteboardShareUrl}>
              <WhiteboardGuestAccessControls whiteboard={whiteboard}>
                <WhiteboardGuestAccessSection guestAccess={guestAccess} />
              </WhiteboardGuestAccessControls>
              {hasUpdatePrivileges && (
                <>
                  {hasPublicSharePrivilege && (
                    <Divider orientation="horizontal" flexItem={true} sx={{ marginTop: gutters(1) }} />
                  )}
                  <CollaborationSettings
                    element={whiteboard}
                    elementType="whiteboard"
                    guestAccessEnabled={guestAccess.enabled}
                  />
                </>
              )}
            </ShareButton>

            {!isSmallScreen && <FullscreenButton />}

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
  );
};

export default WhiteboardView;
