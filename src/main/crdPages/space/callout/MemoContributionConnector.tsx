import { useRef } from 'react';
import { useDeleteContributionMutation, useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';

type MemoContributionConnectorProps = {
  open: boolean;
  contributionId: string;
  memoId: string;
  onClose: () => void;
};

export function MemoContributionConnector({ open, contributionId, memoId, onClose }: MemoContributionConnectorProps) {
  const [deleteContribution] = useDeleteContributionMutation();
  const [fetchMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDeletingRef = useRef(false);

  const handleMemoDeleted = async () => {
    isDeletingRef.current = true;
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    await deleteContribution({
      variables: { contributionId },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    });
  };

  // Mirrors MUI CalloutContributionDialogMemo: refresh markdown in the parent connector
  // (which stays mounted after close) so the delayed refetch actually fires.
  // Hocuspocus's final autosave lags up to ~2s, so we fetch immediately AND after 2.5s.
  const handleClose = () => {
    if (!isDeletingRef.current) {
      void fetchMarkdown({ variables: { id: memoId } });
      refreshTimeoutRef.current = setTimeout(() => {
        void fetchMarkdown({ variables: { id: memoId } });
        refreshTimeoutRef.current = null;
      }, 2500);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <CrdMemoDialog
      open={open}
      memoId={memoId}
      isContribution={true}
      onClose={handleClose}
      onDelete={handleMemoDeleted}
    />
  );
}
