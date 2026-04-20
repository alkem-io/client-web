import { useDeleteContributionMutation } from '@/core/apollo/generated/apollo-hooks';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';

type MemoContributionConnectorProps = {
  open: boolean;
  contributionId: string;
  memoId: string;
  onClose: () => void;
};

export function MemoContributionConnector({ open, contributionId, memoId, onClose }: MemoContributionConnectorProps) {
  const [deleteContribution] = useDeleteContributionMutation();

  // CrdMemoDialog closes the dialog before awaiting onDelete (mirroring MUI MemoDialog
  // to avoid errors from the cache update racing the dismount). Do NOT call onClose
  // here — it's already been called.
  const handleMemoDeleted = async () => {
    await deleteContribution({
      variables: { contributionId },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    });
  };

  if (!open) return null;

  return (
    <CrdMemoDialog open={open} memoId={memoId} isContribution={true} onClose={onClose} onDelete={handleMemoDeleted} />
  );
}
