import { type ReactNode, useState } from 'react';
import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { useScreenSize } from '@/core/ui/grid/constants';
import { Separator } from '@/crd/primitives/separator';
import CollaborationSettings from '@/domain/collaboration/realTimeCollaboration/CollaborationSettings/CollaborationSettings';
import { SaveRequestIndicatorIcon } from '@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon';
import WhiteboardPreviewSettingsButton from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsButton';
import WhiteboardGuestAccessControls from '@/domain/collaboration/whiteboard/WhiteboardShareDialog/WhiteboardGuestAccessControls';
import WhiteboardGuestAccessSection from '@/domain/collaboration/whiteboard/WhiteboardShareDialog/WhiteboardGuestAccessSection';
import { useWhiteboardViewState } from '@/domain/collaboration/whiteboard/WhiteboardsManagement/useWhiteboardViewState';
import type { CollabState } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import type { WhiteboardDetails } from './CrdWhiteboardDialog';
import CrdWhiteboardDialog from './CrdWhiteboardDialog';

export interface CrdWhiteboardViewProps {
  whiteboardId?: string;
  whiteboard: WhiteboardDetails | undefined;
  authorization: { myPrivileges?: AuthorizationPrivilege[] } | undefined;
  whiteboardShareUrl: string;
  guestShareUrl?: string;
  displayName?: ReactNode;
  readOnlyDisplayName?: boolean;
  loadingWhiteboards: boolean;
  preventWhiteboardDeletion?: boolean;
  backToWhiteboards: () => void;
  onWhiteboardDeleted?: () => void;
}

const CrdWhiteboardView = ({
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
}: CrdWhiteboardViewProps) => {
  const [consecutiveSaveErrors, setConsecutiveSaveErrors] = useState(0);
  const [previewSettingsDialogOpen, setPreviewSettingsDialogOpen] = useState(false);

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
    <CrdWhiteboardDialog
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
        previewSettingsDialogOpen,
        headerActions: (collabState: CollabState) => (
          <>
            <ShareButton url={whiteboardShareUrl} entityTypeName="whiteboard" disabled={!whiteboardShareUrl}>
              <WhiteboardGuestAccessControls whiteboard={whiteboard}>
                <WhiteboardGuestAccessSection guestAccess={guestAccess} />
              </WhiteboardGuestAccessControls>
              {hasUpdatePrivileges && (
                <>
                  {hasPublicSharePrivilege && <Separator />}
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
        loadingWhiteboardValue: loadingWhiteboards,
        ...actionsState,
      }}
    />
  );
};

export default CrdWhiteboardView;
