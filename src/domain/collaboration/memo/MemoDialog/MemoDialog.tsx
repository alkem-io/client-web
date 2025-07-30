import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import CollaborativeMarkdownInputWorking from '@/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput_working';
import { CharacterCountContextProvider } from '@/core/ui/forms/MarkdownInput/CharacterCountContext';
import { DialogContent, OutlinedInput } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import useMemoManager from '../MemoManager/useMemoManager';
import Loading from '@/core/ui/loading/Loading';

interface MemoDialogProps {
  open?: boolean;
  onClose?: () => void;
  memoId: string;
  preventMemoDeletion?: boolean;
}

const MemoDialog = ({ open = false, onClose, memoId, preventMemoDeletion }: MemoDialogProps) => {
  const { memo, loading, onDeleteMemo } = useMemoManager({ id: memoId });

  return (
    <DialogWithGrid open={open} onClose={onClose} fullWidth fullHeight>
      <DialogHeader onClose={onClose} />
      <DialogContent>
        {loading && <Loading />}
        {!loading && memo && (
          <CharacterCountContextProvider>
            <OutlinedInput
              inputComponent={CollaborativeMarkdownInputWorking}
              inputProps={{
                controlsVisible: 'always',
                collaborationUUID: memoId,
              }}
              multiline
              sx={{
                '&.MuiOutlinedInput-root': {
                  padding: gutters(0.5),
                },
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
