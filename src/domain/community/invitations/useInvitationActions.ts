import { type ApolloError, useApolloClient } from '@apollo/client';
import {
  refetchV2DashboardFeedSpacesQuery,
  refetchV2DashboardMembershipProbeQuery,
  refetchV2PendingMembershipsQuery,
  useV2RespondToRequestMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { V2RespondToRequestMutation } from '@/core/apollo/generated-v2/graphql-schema';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { InvitationEvent } from './InvitationApplicationConstants';

type RespondedRequest = V2RespondToRequestMutation['respondToRequest']['request'];

interface UseInvitationActionsParams {
  onUpdate?: () => void;
  onAccept?: (spaceUrl: string, request: RespondedRequest) => void;
  onReject?: () => void;
  /** The space whose page answers the invitation: its active reads are refetched after an accept (new verdicts). */
  spaceId?: string;
}

type UseInvitationActionsReturn = {
  updating: boolean;
  // Both return the underlying promise, which REJECTS when the mutation fails. The failure is shown here through
  // useApolloErrorHandler (the native client has no global error link); callers may additionally await and catch it.
  acceptInvitation: (invitationId: string, spaceUrl: string) => Promise<void>;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => Promise<void>;
  rejecting: boolean;
};

/**
 * Accept / decline an invitation through Mutation.respondToRequest(id, event) (screens-dispositions.tsv:10977): the
 * events are the membership_request:invitation lifecycle rows ACCEPT and REJECT (H-community-roles-2, B2.6), the same
 * names as the legacy invitation events. Answering changes the viewer's pending requests and, on accept, their
 * memberships, so the native reads of both are refetched.
 */
const useInvitationActions = ({
  onUpdate,
  onAccept,
  onReject,
  spaceId,
}: UseInvitationActionsParams): UseInvitationActionsReturn => {
  const client = useApolloClient();
  const [respondToRequest] = useV2RespondToRequestMutation();
  const handleError = useApolloErrorHandler();

  const [respond, isResponding] = useLoadingState(async (id: string, event: InvitationEvent) => {
    try {
      const { data } = await respondToRequest({
        variables: { id, event },
        refetchQueries: [
          refetchV2PendingMembershipsQuery(),
          ...(event === InvitationEvent.ACCEPT
            ? [refetchV2DashboardMembershipProbeQuery(), refetchV2DashboardFeedSpacesQuery()]
            : []),
        ],
      });
      if (spaceId && event === InvitationEvent.ACCEPT) {
        await client.refetchQueries({ include: 'active' });
      }
      onUpdate?.();
      return data?.respondToRequest.request;
    } catch (error) {
      handleError(error as ApolloError);
      throw error;
    }
  });

  const [acceptInvitation, isAccepting] = useLoadingState(async (invitationId: string, spaceUrl: string) => {
    const request = await respond(invitationId, InvitationEvent.ACCEPT);
    onAccept?.(spaceUrl, request);
  });

  const [rejectInvitation, isRejecting] = useLoadingState(async (invitationId: string) => {
    await respond(invitationId, InvitationEvent.REJECT);
    onReject?.();
  });

  return {
    updating: isResponding,
    acceptInvitation,
    accepting: isAccepting,
    rejectInvitation,
    rejecting: isRejecting,
  };
};

export default useInvitationActions;
