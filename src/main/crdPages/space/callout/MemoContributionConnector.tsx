import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

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

  // CrdMemoDialog writes the editor content to Apollo cache on close for instant preview updates.
  // Schedule a delayed server fetch as a safety net to reconcile with the canonical server markdown
  // once Hocuspocus has persisted (~2s lag).
  const handleClose = () => {
    if (!isDeletingRef.current) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
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
