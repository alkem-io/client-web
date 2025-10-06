import WhiteboardView from '../../whiteboard/WhiteboardsManagement/WhiteboardView';
import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import { WhiteboardProvider } from '../../whiteboard/containers/WhiteboardProvider';
import { useDeleteContributionMutation } from '@/core/apollo/generated/apollo-hooks';
import useEnsurePresence from '@/core/utils/ensurePresence';

export interface CalloutContributionDialogWhiteboardProps extends CalloutContributionPreviewDialogProps {}

const CalloutContributionDialogWhiteboard = ({
  open,
  onClose,
  contribution,
  onContributionDeleted,
}: CalloutContributionDialogWhiteboardProps) => {
  const ensurePresence = useEnsurePresence();
  if (!open) {
    return null;
  }
  const [deleteContribution] = useDeleteContributionMutation();

  const handleWhiteboardDeleted = async () => {
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
  return (
    <WhiteboardProvider>
      {(entities, state) => (
        <WhiteboardView
          whiteboardId={entities.whiteboard?.id}
          backToWhiteboards={onClose}
          whiteboardShareUrl={entities.whiteboard?.profile.url ?? ''}
          whiteboard={entities.whiteboard}
          authorization={entities.whiteboard?.authorization}
          loadingWhiteboards={state.loadingWhiteboards}
          onWhiteboardDeleted={handleWhiteboardDeleted}
        />
      )}
    </WhiteboardProvider>
  );
};

export default CalloutContributionDialogWhiteboard;
