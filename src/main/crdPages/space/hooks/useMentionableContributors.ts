import { useRef } from 'react';
import { useMentionableContributorsLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import type { CrdMentionSearch, CrdMentionSuggestion } from '@/crd/components/comment/types';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';

const MAX_USERS_LISTED = 30;
const MAX_SPACES_IN_MENTION = 2;
const MAX_MENTION_LENGTH = 30;
const MENTION_INVALID_CHARS_REGEXP = /[?]/;

const hasExcessiveSpaces = (searchTerm: string) => searchTerm.trim().split(' ').length > MAX_SPACES_IN_MENTION + 1;

/**
 * Integration-layer hook wrapping the legacy `MentionableContributors` query
 * for use by CRD comment inputs. Returns a plain search callback that maps the
 * Apollo result onto the CRD-facing `CrdMentionSuggestion` shape — the CRD
 * component never imports Apollo or domain types.
 *
 * Mirrors the filtering rules from `CommentInputField.tsx` (legacy MUI):
 * empty queries, queries with invalid chars (`?`), >2 internal spaces, and
 * queries longer than 30 chars short-circuit to `[]`.
 *
 * `roleSetId` is picked from the innermost available space context (subspace
 * first, then space). When no room is in context the id is falsy and the
 * virtual-contributor branch of the query is skipped — matching legacy
 * behavior.
 */
export function useMentionableContributors(): CrdMentionSearch {
  const [queryUsers] = useMentionableContributorsLazyQuery();
  const { space } = useSpace();
  const { subspace } = useSubSpace();

  const emptyQueriesRef = useRef<string[]>([]);

  const spaceRoleSetId = space.about.membership?.roleSetID;
  const subspaceRoleSetId = subspace.about.membership?.roleSetID;
  const roleSetId = subspaceRoleSetId || spaceRoleSetId;

  return async (search: string): Promise<CrdMentionSuggestion[]> => {
    const emptyQueries = emptyQueriesRef.current;

    if (
      !search ||
      emptyQueries.some(query => search.startsWith(query)) ||
      hasExcessiveSpaces(search) ||
      MENTION_INVALID_CHARS_REGEXP.test(search) ||
      search.length > MAX_MENTION_LENGTH
    ) {
      return [];
    }

    const { data } = await queryUsers({
      variables: {
        filter: { email: search, displayName: search },
        first: MAX_USERS_LISTED,
        roleSetId: roleSetId ? roleSetId : undefined,
        includeVirtualContributors: Boolean(roleSetId),
      },
    });

    const suggestions: CrdMentionSuggestion[] = [];

    data?.lookup?.roleSet?.virtualContributorsInRoleInHierarchy?.forEach(vc => {
      if (!vc.profile?.url) return;
      if (!vc.profile.displayName.toLowerCase().includes(search.toLowerCase())) return;
      suggestions.push({
        id: vc.profile.url,
        displayName: vc.profile.displayName,
        avatarUrl: vc.profile.avatar?.uri,
        virtualContributor: true,
      });
    });

    data?.usersPaginated.users.forEach(user => {
      if (!user.profile?.url) return;
      suggestions.push({
        id: user.profile.url,
        displayName: user.profile.displayName,
        avatarUrl: user.profile.avatar?.uri,
        city: user.profile.location?.city,
        country: user.profile.location?.country,
      });
    });

    if (suggestions.length === 0) {
      emptyQueries.push(search);
    }

    return suggestions;
  };
}
