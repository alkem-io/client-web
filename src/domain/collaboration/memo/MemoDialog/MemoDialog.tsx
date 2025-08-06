import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import CollaborativeMarkdownInput from '@/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput';
import { CharacterCountContextProvider } from '@/core/ui/forms/MarkdownInput/CharacterCountContext';
import { Box, DialogContent, OutlinedInput } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import useMemoManager from '../MemoManager/useMemoManager';
import Loading from '@/core/ui/loading/Loading';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useState, useRef, useEffect } from 'react';
import UserPresencing from '../../realTimeCollaboration/UserPresencing';
import { RealTimeCollaborationState } from '../../realTimeCollaboration/RealTimeCollaborationState';

interface MemoDialogProps {
  open?: boolean;
  onClose?: () => void;
  memoId: string;
  preventMemoDeletion?: boolean;
}

const MemoDialog = ({ open = false, onClose, memoId, preventMemoDeletion }: MemoDialogProps) => {
  const [fullScreen, setFullScreen] = useState(false);
  const [forceExitFullscreen, setForceExitFullscreen] = useState(false);
  const [collaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { memo, loading, onDeleteMemo } = useMemoManager({ id: memoId });

  const handleClose = () => {
    // Declaratively trigger fullscreen exit
    setForceExitFullscreen(true);
    setFullScreen(false);
    onClose?.();
  };

  // Reset force exit flag when dialog opens
  const handleDialogOpen = () => {
    if (open) {
      setForceExitFullscreen(false);
    }
  };

  useEffect(() => {
    handleDialogOpen();
  }, [open]);

  return (
    <DialogWithGrid ref={dialogRef} open={open} onClose={handleClose} fullWidth fullHeight fullScreen={fullScreen}>
      <DialogHeader
        onClose={handleClose}
        actions={
          <>
            <ShareButton url={memo?.profile.url} entityTypeName="memo" disabled={!memo?.profile.url}>
              {/*hasUpdatePrivileges && (
              <WhiteboardShareSettings createdBy={whiteboard?.createdBy} {...contentUpdatePolicyProvided} />
            )*/}
            </ShareButton>

            <FullscreenButton
              element={dialogRef.current || undefined}
              onChange={setFullScreen}
              forceExit={forceExitFullscreen}
            />
            <UserPresencing collaborationState={collaborationState} />
          </>
        }
      >
        Memo
      </DialogHeader>
      <DialogContent>
        <Box position="relative" height="100%" width="100%">
          {loading && <Loading />}
          {collaborationState?.status !== 'connected' && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={1}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              <Loading text="Connecting to collaboration service..." />
            </Box>
          )}
          {!loading && memo && (
            <CharacterCountContextProvider>
              <OutlinedInput
                inputComponent={CollaborativeMarkdownInput}
                inputProps={{
                  controlsVisible: 'always',
                  collaborationId: memoId,
                  height: '100%',
                  onChangeCollaborationState: setCollaborationState,
                }}
                multiline
                sx={{
                  '&.MuiOutlinedInput-root': {
                    padding: gutters(0.5),
                  },
                  height: '100%',
                  minHeight: 'calc(100vh - 200px)',
                  alignItems: 'flex-start',
                }}
                fullWidth
              />
            </CharacterCountContextProvider>
          )}
        </Box>
      </DialogContent>
      <DialogFooter>{!preventMemoDeletion && <DeleteButton onClick={onDeleteMemo} />}</DialogFooter>
    </DialogWithGrid>
  );
};

export default MemoDialog;
