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
import { useState } from 'react';
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
  const [collaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();

  const { memo, loading, onDeleteMemo } = useMemoManager({ id: memoId });

  return (
    <DialogWithGrid open={open} onClose={onClose} fullWidth fullHeight fullScreen={fullScreen}>
      <DialogHeader
        onClose={onClose}
        actions={
          <>
            <ShareButton url={memo?.profile.url} entityTypeName="memo" disabled={!memo?.profile.url}>
              {/*hasUpdatePrivileges && (
              <WhiteboardShareSettings createdBy={whiteboard?.createdBy} {...contentUpdatePolicyProvided} />
            )*/}
            </ShareButton>

            <FullscreenButton onChange={setFullScreen} />
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
