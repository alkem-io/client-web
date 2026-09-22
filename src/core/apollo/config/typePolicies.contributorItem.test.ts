import { InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { ContributorCollectionByTypeDocument } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, type ContributorCollectionByTypeQuery } from '@/core/apollo/generated/graphql-schema';
import { typePolicies } from './typePolicies';

/**
 * The same contributor can be listed by two different Contributors posts (a
 * space's and one of its subspaces) with a different role label and join
 * month in each. Without a cache-identity fix, Apollo's default normalization
 * (by `id` alone) would let the second post's write silently overwrite the
 * first post's values for every card that lists the same contributor — this
 * test writes both posts' results into one cache and reads both back to prove
 * that no longer happens.
 */
describe('Apollo cache identity — ContributorCollectionItem', () => {
  const variablesFor = (calloutId: string) => ({ calloutId, type: ActorType.User });

  // The fixture deliberately writes explicit `null` for every unselected
  // optional field (what a real network response sends over the wire), while
  // the generated query type models an absent field as `T | undefined`
  // (`preResolveTypes` / `maybeValue` codegen config) — cast at the boundary.
  const resultFor = (
    calloutId: string,
    framingId: string,
    roleLabel: string,
    joinedDate: string
  ): ContributorCollectionByTypeQuery =>
    ({
      lookup: {
        __typename: 'LookupQueryResults',
        callout: {
          __typename: 'Callout',
          id: calloutId,
          framing: {
            __typename: 'CalloutFraming',
            id: framingId,
            contributors: [
              {
                __typename: 'ContributorCollectionItem',
                id: 'user-ada',
                type: ActorType.User,
                displayName: 'Ada',
                avatarUrl: null,
                roleLabel,
                url: 'https://alkemio.test/ada',
                location: null,
                tagline: null,
                tags: null,
                joinedDate,
                website: null,
                associatesCount: null,
              },
            ],
          },
        },
      },
      // biome-ignore lint/suspicious/noExplicitAny: fixture models the raw
      // network payload (explicit nulls), not the codegen's `| undefined` shape
    }) as any;

  it("keeps each post's own roleLabel and joinedDate for the same contributor id", () => {
    const cache = new InMemoryCache({ typePolicies });

    const spaceResult = resultFor('callout-space', 'framing-space', 'member', '2023-10-01T00:00:00.000Z');
    const subspaceResult = resultFor('callout-subspace', 'framing-subspace', 'lead', '2024-01-01T00:00:00.000Z');

    cache.writeQuery<ContributorCollectionByTypeQuery>({
      query: ContributorCollectionByTypeDocument,
      variables: variablesFor('callout-space'),
      data: spaceResult,
    });
    cache.writeQuery<ContributorCollectionByTypeQuery>({
      query: ContributorCollectionByTypeDocument,
      variables: variablesFor('callout-subspace'),
      data: subspaceResult,
    });

    const spaceRead = cache.readQuery<ContributorCollectionByTypeQuery>({
      query: ContributorCollectionByTypeDocument,
      variables: variablesFor('callout-space'),
    });
    const subspaceRead = cache.readQuery<ContributorCollectionByTypeQuery>({
      query: ContributorCollectionByTypeDocument,
      variables: variablesFor('callout-subspace'),
    });

    const spaceItem = spaceRead?.lookup.callout?.framing.contributors[0];
    const subspaceItem = subspaceRead?.lookup.callout?.framing.contributors[0];

    // The load-bearing assertion: each post keeps its own role label,
    // independent of whether the join-month line ships or is later dropped.
    expect(spaceItem?.roleLabel).toBe('member');
    expect(subspaceItem?.roleLabel).toBe('lead');

    // Asserted only while joinedDate is selected on the document. Cache reads
    // return the raw JSON scalar value (the DateTime -> Date coercion happens
    // in the network link, not on a direct cache write/read), so compare the
    // ISO string.
    expect(spaceItem?.joinedDate).toEqual('2023-10-01T00:00:00.000Z');
    expect(subspaceItem?.joinedDate).toEqual('2024-01-01T00:00:00.000Z');
  });
});
