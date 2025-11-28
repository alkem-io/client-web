import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import MemoDialog from '@/domain/collaboration/memo/MemoDialog/MemoDialog';
import { useDeleteContributionMutation, useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import useEnsurePresence from '@/core/utils/ensurePresence';

export interface CalloutContributionDialogMemoProps extends CalloutContributionPreviewDialogProps {}

const CalloutContributionDialogMemo = ({
  open,
  onClose,
  contribution,
  calloutId,
  onContributionDeleted,
}: CalloutContributionDialogMemoProps) => {
  const ensurePresence = useEnsurePresence();
  const memoId = contribution?.memo?.id;

  const [deleteContribution] = useDeleteContributionMutation();
  const [fetchMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });

  const handleMemoDeleted = async () => {
    const contributionId = ensurePresence(contribution?.id, 'ContributionId');
    await deleteContribution({
      variables: {
        contributionId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
      onCompleted: data => {
        onContributionDeleted(data.deleteContribution.id);
      },
    });
  };

  const handleClose = () => {
    if (memoId) {
      // Refresh immediately to catch already-saved content
      void fetchMarkdown({ variables: { id: memoId } });

      // Also refresh after 2.5 seconds to catch any pending autosave
      setTimeout(() => {
        void fetchMarkdown({ variables: { id: memoId } });
      }, 2500);
    }

    onClose();
  };

  if (!open || !contribution?.memo || !calloutId) {
    return null;
  }

  return (
    <MemoDialog
      open={open}
      onClose={handleClose}
      memoId={contribution.memo.id}
      calloutId={calloutId}
      onDelete={handleMemoDeleted}
      isContribution
    />
  );
};

export default CalloutContributionDialogMemo;
