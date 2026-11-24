import { ApolloError } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';

const fetchActorDetails = vi.fn();

const entries = [
  { id: 'e1', actor: { id: 'unavailable' } },
  { id: 'e2', actor: { id: 'visible' } },
];

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  ActivityCreatedDocument: {},
  useActivityLogOnCollaborationQuery: () => ({
    data: { activityLogOnCollaboration: entries },
    loading: false,
    subscribeToMore: vi.fn(),
    refetch: vi.fn(),
  }),
  useActorDetailsLazyQuery: () => [fetchActorDetails],
}));
vi.mock('@/core/apollo/subscriptions/useSubscriptionToSubEntity', () => ({
  default: () => () => undefined,
}));

import useActivityOnCollaboration from './useActivityOnCollaboration';

const visibleActor = { data: { actor: { id: 'visible', type: ActorType.User, firstName: 'Ada', lastName: 'L' } } };

const activitiesWhenUnavailableActorAnswers = async (answer: unknown) => {
  fetchActorDetails.mockReset();
  fetchActorDetails.mockImplementation(async ({ variables }) =>
    variables.actorId === 'unavailable' ? answer : visibleActor
  );
  const { result } = renderHook(() => useActivityOnCollaboration('collab-1', { limit: 10 }));
  await waitFor(() => expect(result.current.activities?.[1]).toHaveProperty('actor.firstName', 'Ada'));
  return result.current.activities;
};

describe('useActivityOnCollaboration — actor details', () => {
  it('treats an actor that is not available like one that returns no actor', async () => {
    const unavailable = await activitiesWhenUnavailableActorAnswers({
      data: undefined,
      error: new ApolloError({
        graphQLErrors: [new GraphQLError('not available', { extensions: { code: 'FORBIDDEN_POLICY' } })],
      }),
    });
    const missing = await activitiesWhenUnavailableActorAnswers({ data: { actor: null } });

    expect(unavailable).toEqual(missing);
    expect(unavailable?.[0]).toEqual(entries[0]);
  });
});
