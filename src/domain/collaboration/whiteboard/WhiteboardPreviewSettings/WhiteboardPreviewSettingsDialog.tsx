import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { DialogContent } from '@mui/material';
import { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { useEffect } from 'react';
import useExportWhiteboardImage from './useExportWhiteboardImage';
import useEnsurePresence from '@/core/utils/ensurePresence';

interface WhiteboardPreviewSettingsDialogProps {
  open?: boolean;
  onClose?: DialogHeaderProps['onClose'];
  whiteboard: WhiteboardDetails;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

const WhiteboardPreviewSettingsDialog = ({ open = false, onClose, whiteboard, excalidrawAPI }: WhiteboardPreviewSettingsDialogProps) => {
  const ensurePresence = useEnsurePresence();
  const exportWhiteboardImage = useExportWhiteboardImage();

  useEffect(() => {
    if (!open || !excalidrawAPI) {
      return;
    }

    (async () => {
      const excalidrawState = {
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      };
      const image = await exportWhiteboardImage(excalidrawState)

    })();

  }, [open, whiteboard, excalidrawAPI]);
  return (
    <DialogWithGrid onClose={onClose} open={open}>
      <DialogHeader onClose={onClose} title="Whiteboard Preview Settings" />
      <DialogContent>
        <div>Whiteboard Preview Settings Content</div>
      </DialogContent>
    </DialogWithGrid>
  );
}

export default WhiteboardPreviewSettingsDialog;
