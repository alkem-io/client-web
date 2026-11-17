import {
  refetchPendingInvitationsCountQuery,
  refetchPendingInvitationsQuery,
  useInvitationStateEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { InvitationEvent } from './InvitationApplicationConstants';

interface UseInvitationActionsParams {
  onUpdate?: () => void;
  onAccept?: (spaceUrl: string) => void;
  onReject?: () => void;
}

type UseInvitationActionsReturn = {
  updating: boolean;
  // Both return the underlying promise, which REJECTS when the mutation
  // fails. Callers that need to surface the failure (FORBIDDEN /
  // FORBIDDEN_POLICY are excluded from the global Apollo error handler, so
  // nothing else will) must await and catch it; callers that don't care may
  // keep ignoring the result.
  acceptInvitation: (invitationId: string, spaceUrl: string) => Promise<void>;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => Promise<void>;
  rejecting: boolean;
};

const useInvitationActions = ({
  onUpdate,
  onAccept,
  onReject,
}: UseInvitationActionsParams): UseInvitationActionsReturn => {
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
      // Membership changes privileges across many queries (comments, callouts,
      // admin options). Drop every cached query so nothing stale is served
      // later, and refetch the ones on screen. Not awaited: a failed refetch
      // never turns a successful accept into an error.
      update: cache => {
        cache.evict({ id: 'ROOT_QUERY' });
      },
      refetchQueries: 'active',
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

  return {
    updating: isUpdatingInvitationState,
    acceptInvitation,
    accepting: isAccepting,
    rejectInvitation,
    rejecting: isRejecting,
  };
};

export default useInvitationActions;
