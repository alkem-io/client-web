import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import MemoDialog from '@/domain/collaboration/memo/MemoDialog/MemoDialog';
import { useDeleteContributionMutation } from '@/core/apollo/generated/apollo-hooks';
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

  const [deleteContribution] = useDeleteContributionMutation();

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

  if (!open || !contribution?.memo || !calloutId) {
    return null;
  }

  return (
    <MemoDialog
      open={open}
      onClose={onClose}
      memoId={contribution.memo.id}
      calloutId={calloutId}
      onDelete={handleMemoDeleted}
      isContribution
    />
  );
};

export default CalloutContributionDialogMemo;
