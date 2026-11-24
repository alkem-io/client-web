import { ApolloError } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';

const fetchActorDetails = vi.fn();
const mutation = () => [vi.fn(), { loading: false }];

const invitationFrom = (actorId: string) => ({
  id: `inv-${actorId}`,
  actor: { id: actorId, type: ActorType.User, profile: { id: `p-${actorId}`, displayName: actorId } },
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchUserPendingMembershipsQuery: vi.fn(),
  useActorDetailsLazyQuery: () => [fetchActorDetails],
  useCommunityApplicationsInvitationsQuery: () => ({
    data: {
      lookup: {
        roleSet: {
          applications: [],
          invitations: [invitationFrom('unavailable'), invitationFrom('visible')],
          platformInvitations: [],
        },
      },
    },
    loading: false,
    refetch: vi.fn(),
  }),
  useApplyForEntryRoleOnRoleSetMutation: () => mutation(),
  useDeleteInvitationMutation: () => mutation(),
  useDeletePlatformInvitationMutation: () => mutation(),
  useEventOnApplicationMutation: () => mutation(),
  useInvitationStateEventMutation: () => mutation(),
  useInviteForEntryRoleOnRoleSetMutation: () => mutation(),
  useResendPlatformInvitationMutation: () => mutation(),
}));

import useRoleSetApplicationsAndInvitations from './useRoleSetApplicationsAndInvitations';

const visibleActor = { data: { actor: { id: 'visible', type: ActorType.User, email: 'visible@example.org' } } };

const invitationsWhenUnavailableActorAnswers = async (answer: unknown) => {
  fetchActorDetails.mockReset();
  fetchActorDetails.mockImplementation(async ({ variables }) =>
    variables.actorId === 'unavailable' ? answer : visibleActor
  );
  const { result } = renderHook(() => useRoleSetApplicationsAndInvitations({ roleSetId: 'rs-1' }));
  await waitFor(() => expect(result.current.invitations[1].actor.profile?.email).toBe('visible@example.org'));
  return result.current.invitations;
};

describe('useRoleSetApplicationsAndInvitations — actor details', () => {
  it('treats an actor that is not available like one that returns no actor', async () => {
    const unavailable = await invitationsWhenUnavailableActorAnswers({
      data: undefined,
      error: new ApolloError({
        graphQLErrors: [new GraphQLError('not available', { extensions: { code: 'FORBIDDEN_POLICY' } })],
      }),
    });
    const missing = await invitationsWhenUnavailableActorAnswers({ data: { actor: null } });

    expect(unavailable).toEqual(missing);
    expect(unavailable[0].actor.profile?.email).toBeUndefined();
  });
});
