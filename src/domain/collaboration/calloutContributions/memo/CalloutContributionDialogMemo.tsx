import { useRef } from 'react';
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
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDeletingRef = useRef(false);

  const [deleteContribution] = useDeleteContributionMutation();
  const [fetchMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });

  const handleMemoDeleted = async () => {
    isDeletingRef.current = true;
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
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
    if (memoId && !isDeletingRef.current) {
      // Refresh immediately to catch already-saved content
      void fetchMarkdown({ variables: { id: memoId } });

      // Also refresh after 2.5 seconds to catch any pending autosave
      refreshTimeoutRef.current = setTimeout(() => {
        void fetchMarkdown({ variables: { id: memoId } });
        refreshTimeoutRef.current = null;
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
