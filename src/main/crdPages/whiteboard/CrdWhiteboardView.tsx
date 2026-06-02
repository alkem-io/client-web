import { ScanEye } from 'lucide-react';
import { type ReactNode, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { useScreenSize } from '@/core/ui/grid/constants';
import { Loading } from '@/crd/components/common/Loading';
import { ShareButton } from '@/crd/components/common/ShareButton';
import { Button } from '@/crd/primitives/button';
import { Separator } from '@/crd/primitives/separator';
import { useWhiteboardViewState } from '@/domain/collaboration/whiteboard/WhiteboardsManagement/useWhiteboardViewState';
import type { CollabState } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import { CrdCollaborationSettings } from '@/main/crdPages/whiteboard/CrdCollaborationSettings';
import { CrdWhiteboardGuestAccessControls } from '@/main/crdPages/whiteboard/CrdWhiteboardGuestAccessControls';
import type { WhiteboardDetails } from './CrdWhiteboardDialog';
import CrdWhiteboardDialog from './CrdWhiteboardDialog';
import { CrdWhiteboardSaveStatus } from './CrdWhiteboardSaveStatus';

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
  const { t: tWb } = useTranslation('crd-whiteboard');
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
    <Suspense fallback={<Loading />}>
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
              <ShareButton url={whiteboardShareUrl} disabled={!whiteboardShareUrl}>
                <CrdWhiteboardGuestAccessControls whiteboard={whiteboard} guestAccess={guestAccess} />
                {hasUpdatePrivileges && (
                  <>
                    {hasPublicSharePrivilege && <Separator />}
                    <CrdCollaborationSettings
                      element={whiteboard}
                      elementType="whiteboard"
                      guestAccessEnabled={guestAccess.enabled}
                    />
                  </>
                )}
              </ShareButton>

              {!isSmallScreen && <FullscreenButton />}

              <CrdWhiteboardSaveStatus isSaved={consecutiveSaveErrors < 6} date={lastSuccessfulSavedDate} />

              {hasUpdatePrivileges && collabState.mode === 'write' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewSettingsDialogOpen(true)}
                  aria-label={tWb('preview.editButton')}
                >
                  <ScanEye />
                </Button>
              )}
            </>
          ),
        }}
        state={{
          loadingWhiteboardValue: loadingWhiteboards,
          ...actionsState,
        }}
      />
    </Suspense>
  );
};

export default CrdWhiteboardView;
