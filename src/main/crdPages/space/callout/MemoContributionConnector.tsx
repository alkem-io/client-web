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

  const handleMemoDeleted = async () => {
    await deleteContribution({
      variables: { contributionId },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    });
    onClose();
  };

  if (!open) return null;

  return (
    <CrdMemoDialog open={open} memoId={memoId} isContribution={true} onClose={onClose} onDelete={handleMemoDeleted} />
  );
}
