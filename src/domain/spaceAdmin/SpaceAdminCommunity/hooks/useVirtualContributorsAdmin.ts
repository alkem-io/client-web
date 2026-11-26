import { useSpaceCommunityCandidatesLazyQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { CandidateEntry } from '@/core/apollo/generated-v2/graphql-schema';
import {
  ACTOR_TYPE,
  SPACE_ROLE,
  type SpaceCommunityCandidate,
  toSpaceCommunityCandidate,
} from '@/domain/spaceAdmin/SpaceAdminCommunity/native/spaceCommunityNative';

interface useVirtualContributorsAdminParams {
  spaceId: string;
}

export interface useVirtualContributorsAdminProvided {
  virtualContributorAdmin: {
    /** VCs this viewer may add directly as members (account VCs) — `candidates(entry: DIRECT)`. */
    getAvailable: (filter?: string) => Promise<SpaceCommunityCandidate[]>;
    /** VCs this viewer may invite (library VCs) — `candidates(entry: INVITE)`. */
    getAvailableInLibrary: (filter: string | undefined) => Promise<SpaceCommunityCandidate[]>;
  };
}

const PAGE_SIZE = 100;

/**
 * VC candidates for a space's member role (invite-candidates, community-roles-screens.tsv:173).
 * The server decides admission — account agency, current holders and open requests are filtered
 * before paging — so the client only reads every page of each list.
 */
const useVirtualContributorsAdmin = ({
  spaceId,
}: useVirtualContributorsAdminParams): useVirtualContributorsAdminProvided => {
  // One lazy query per entry so the two lists can load concurrently without sharing one observable.
  const [fetchDirect] = useSpaceCommunityCandidatesLazyQuery({ fetchPolicy: 'network-only' });
  const [fetchInvite] = useSpaceCommunityCandidatesLazyQuery({ fetchPolicy: 'network-only' });

  const loadAll = async (
    fetchPage: typeof fetchDirect,
    entry: CandidateEntry,
    filter: string | undefined
  ): Promise<SpaceCommunityCandidate[]> => {
    const candidates: SpaceCommunityCandidate[] = [];
    let after: string | undefined;
    do {
      const { data, error } = await fetchPage({
        variables: {
          space: spaceId,
          role: SPACE_ROLE.Member,
          entry,
          actorType: ACTOR_TYPE.VirtualContributor,
          terms: filter || undefined,
          first: PAGE_SIZE,
          after,
        },
      });
      if (error) throw error;
      if (!data) throw new Error('candidates returned no result');
      candidates.push(...data.candidates.edges.map(edge => toSpaceCommunityCandidate(edge.node)));
      const { hasNextPage, endCursor } = data.candidates.pageInfo;
      if (hasNextPage && (!endCursor || endCursor === after)) {
        throw new Error('candidates continuation did not advance its cursor');
      }
      after = hasNextPage ? (endCursor ?? undefined) : undefined;
    } while (after);
    return candidates;
  };

  return {
    virtualContributorAdmin: {
      getAvailable: filter => loadAll(fetchDirect, CandidateEntry.Direct, filter),
      getAvailableInLibrary: filter => loadAll(fetchInvite, CandidateEntry.Invite, filter),
    },
  };
};

export default useVirtualContributorsAdmin;
