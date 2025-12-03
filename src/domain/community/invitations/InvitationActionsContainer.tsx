import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  refetchLatestContributionsSpacesFlatQuery,
  refetchPendingInvitationsCountQuery,
  refetchPendingInvitationsQuery,
  refetchSpaceAboutBaseQuery,
  useInvitationStateEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { InvitationEvent } from './InvitationApplicationConstants';

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
  /**
   * When provided, the SpaceAboutBaseQuery for this space will be refetched after accepting
   * an invitation, ensuring the user's new permissions are reflected immediately.
   */
  spaceId?: string;
}

const InvitationActionsContainer = ({
  onUpdate,
  onAccept,
  onReject,
  spaceId,
  children,
}: InvitationActionsContainerProps) => {
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
        eventName: InvitationEvent.ACCEPT,
      },
      onCompleted: () => {
        onAccept?.(spaceUrl);
      },
      refetchQueries: [
        refetchLatestContributionsSpacesFlatQuery(),
        refetchPendingInvitationsQuery(),
        refetchPendingInvitationsCountQuery(),
        // Refetch space privileges so the user's new permissions are reflected immediately
        ...(spaceId ? [refetchSpaceAboutBaseQuery({ spaceId })] : []),
      ],
    })
  );

  const [rejectInvitation, isRejecting] = useLoadingState((invitationId: string) =>
    updateInvitationState({
      variables: {
        invitationId,
        eventName: InvitationEvent.REJECT,
      },
      onCompleted: () => {
        onReject?.();
      },
      refetchQueries: [refetchPendingInvitationsQuery(), refetchPendingInvitationsCountQuery()],
    })
  );

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
