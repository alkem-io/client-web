import { useDeleteContributionMutation, useWhiteboardFromCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';

type WhiteboardContributionConnectorProps = {
  open: boolean;
  calloutId: string;
  contributionId: string;
  onClose: () => void;
};

export function WhiteboardContributionConnector({
  open,
  calloutId,
  contributionId,
  onClose,
}: WhiteboardContributionConnectorProps) {
  const { data, loading } = useWhiteboardFromCalloutQuery({
    variables: { calloutId, contributionId },
    skip: !open || !calloutId || !contributionId,
  });

  const [deleteContribution] = useDeleteContributionMutation();

  const callout = data?.lookup.callout;
  const whiteboardContribution = callout?.contributions[0];
  const whiteboard = whiteboardContribution?.whiteboard;
  const authorization = callout?.authorization;

  const guestShareUrl = whiteboard ? buildGuestShareUrl(whiteboard.id ?? whiteboard.nameID) : undefined;

  const handleWhiteboardDeleted = async () => {
    if (!whiteboardContribution?.id) return;
    await deleteContribution({
      variables: { contributionId: whiteboardContribution.id },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    });
    onClose();
  };

  if (!open) return null;

  return (
    <CrdWhiteboardView
      whiteboardId={whiteboard?.id}
      whiteboard={whiteboard}
      authorization={authorization}
      whiteboardShareUrl={whiteboard?.profile.url ?? ''}
      guestShareUrl={guestShareUrl}
      loadingWhiteboards={loading}
      backToWhiteboards={onClose}
      onWhiteboardDeleted={handleWhiteboardDeleted}
    />
  );
}
