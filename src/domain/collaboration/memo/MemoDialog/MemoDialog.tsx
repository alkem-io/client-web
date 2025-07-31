import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import CollaborativeMarkdownInput from '@/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput';
import { CharacterCountContextProvider } from '@/core/ui/forms/MarkdownInput/CharacterCountContext';
import { DialogContent, OutlinedInput } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import useMemoManager from '../MemoManager/useMemoManager';
import Loading from '@/core/ui/loading/Loading';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useState } from 'react';
import UserPresencing from '../../onlineCollaboration/UserPresencing';
import { OnlineCollaborationState } from '../../onlineCollaboration/OnlineCollaborationState';

interface MemoDialogProps {
  open?: boolean;
  onClose?: () => void;
  memoId: string;
  preventMemoDeletion?: boolean;
}

const MemoDialog = ({ open = false, onClose, memoId, preventMemoDeletion }: MemoDialogProps) => {
  const [fullScreen, setFullScreen] = useState(false);
  const [collaborationState, setCollaborationState] = useState<OnlineCollaborationState>();

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
        {loading && <Loading />}
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
      </DialogContent>
      <DialogFooter>{!preventMemoDeletion && <DeleteButton onClick={onDeleteMemo} />}</DialogFooter>
    </DialogWithGrid>
  );
};

export default MemoDialog;
