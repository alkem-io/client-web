import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  refetchLatestContributionsSpacesFlatQuery,
  refetchPendingInvitationsCountQuery,
  refetchPendingInvitationsQuery,
  useInvitationStateEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';

type InvitationActionsContainerProvided = {
  updating: boolean;
  acceptInvitation: (invitationId: string, spaceUrl: string) => void;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => void;
  rejecting: boolean;
};

interface InvitationActionsContainerProps extends SimpleContainerProps<InvitationActionsContainerProvided> {
  onUpdate?: () => void;
  onAccept?: (spaceUrl: string) => void;
  onReject?: () => void;
}

const InvitationActionsContainer = ({ onUpdate, onAccept, onReject, children }: InvitationActionsContainerProps) => {
  const [invitationStateEventMutation] = useInvitationStateEventMutation();

  const [updateInvitationState, isUpdatingInvitationState] = useLoadingState(
    async (...args: Parameters<typeof invitationStateEventMutation>) => {
      await invitationStateEventMutation(...args);
      onUpdate?.();
    }
  );

  const [acceptInvitation, isAccepting] = useLoadingState((invitationId: string, spaceUrl: string) =>
    updateInvitationState({
      variables: {
        invitationId,
        eventName: 'ACCEPT',
      },
      onCompleted: () => {
        onAccept?.(spaceUrl);
      },
      refetchQueries: [
        refetchLatestContributionsSpacesFlatQuery(),
        refetchPendingInvitationsQuery(),
        refetchPendingInvitationsCountQuery(),
      ],
    })
  );

  const [rejectInvitation, isRejecting] = useLoadingState((invitationId: string) =>
    updateInvitationState({
      variables: {
        invitationId,
        eventName: 'REJECT',
      },
      onCompleted: () => {
        onReject?.();
      },
      refetchQueries: [refetchPendingInvitationsQuery(), refetchPendingInvitationsCountQuery()],
    })
  );

  // TODO Uncomment when hiding an Invitation is available in the API
  // const [hideInvitation, isHiding] = useLoadingState((invitationId: string) =>
  //   deleteInvitation({
  //     variables: {
  //       invitationId,
  //     },
  //   })
  // );

  return (
    <>
      {children({
        updating: isUpdatingInvitationState,
        acceptInvitation,
        accepting: isAccepting,
        rejectInvitation,
        rejecting: isRejecting,
      })}
    </>
  );
};

export default InvitationActionsContainer;
