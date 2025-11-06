import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import MemoDialog from '@/domain/collaboration/memo/MemoDialog/MemoDialog';

export interface CalloutContributionDialogMemoProps extends CalloutContributionPreviewDialogProps {}

const CalloutContributionDialogMemo = ({
  open,
  onClose,
  contribution,
  calloutId,
}: CalloutContributionDialogMemoProps) => {
  if (!open || !contribution?.memo || !calloutId) {
    return null;
  }

  return <MemoDialog open={open} onClose={onClose} memoId={contribution.memo.id} calloutId={calloutId} />;
};

export default CalloutContributionDialogMemo;
