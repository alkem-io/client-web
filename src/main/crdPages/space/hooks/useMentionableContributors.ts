import { useEffect, useRef } from 'react';
import { useMentionableContributorsLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { CrdMentionSearch, CrdMentionSuggestion } from '@/crd/components/comment/types';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';

const MAX_USERS_LISTED = 30;
const MAX_SPACES_IN_MENTION = 2;
const MAX_MENTION_LENGTH = 30;
const MENTION_INVALID_CHARS_REGEXP = /[?]/;
const MENTION_DEBOUNCE_MS = 300;

const hasExcessiveSpaces = (searchTerm: string) => searchTerm.trim().split(' ').length > MAX_SPACES_IN_MENTION + 1;

/**
 * Integration-layer hook wrapping the `MentionableContributors` query for use
 * by CRD comment inputs. Returns a plain search callback that maps the Apollo
 * result onto the CRD-facing `CrdMentionSuggestion` shape — the CRD component
 * never imports Apollo or domain types.
 *
 * Mirrors the input-filtering rules from `CommentInputField.tsx` (legacy MUI):
 * empty queries, queries with invalid chars (`?`), >2 internal spaces, and
 * queries longer than 30 chars short-circuit to `[]`.
 *
 * Network calls are debounced by {@link MENTION_DEBOUNCE_MS} ms (trailing
 * edge). Calls that arrive within the window share a single resolved value —
 * each pending Promise resolves with the suggestions for the *latest* search
 * term, so the caller never sees a stale or empty intermediate result.
 *
 * The Space ID is taken from the innermost available Space context (subspace
 * first, then space). The server derives the visibility-aware Member scope
 * from that ID alone — no role-set / parent-space lookup happens here.
 */
export function useMentionableContributors(): CrdMentionSearch {
  const [queryUsers] = useMentionableContributorsLazyQuery();
  const { space } = useSpace();
  const { subspace } = useSubSpace();

  const emptyQueriesRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResolversRef = useRef<Array<(suggestions: CrdMentionSuggestion[]) => void>>([]);

  const spaceID = subspace.id || space.id;

  useEffect(() => {
    emptyQueriesRef.current = [];
  }, [spaceID]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    []
  );

  return (search: string): Promise<CrdMentionSuggestion[]> => {
    const emptyQueries = emptyQueriesRef.current;

    if (
      !search ||
      !spaceID ||
      emptyQueries.some(query => search.startsWith(query)) ||
      hasExcessiveSpaces(search) ||
      MENTION_INVALID_CHARS_REGEXP.test(search) ||
      search.length > MAX_MENTION_LENGTH
    ) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      for (const resolve of pendingResolversRef.current.splice(0)) {
        resolve([]);
      }
      return Promise.resolve([]);
    }

    return new Promise<CrdMentionSuggestion[]>(resolve => {
      pendingResolversRef.current.push(resolve);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        debounceTimerRef.current = null;
        const resolvers = pendingResolversRef.current.splice(0);

        try {
          const { data } = await queryUsers({
            variables: {
              spaceID,
              filter: { displayName: search },
              limit: MAX_USERS_LISTED,
            },
            fetchPolicy: 'network-only',
            errorPolicy: 'all', // todo: temporarily ignore unsufficient VC read access
          });

          const suggestions: CrdMentionSuggestion[] = [];

          data?.lookup?.space?.mentionableContributors?.forEach(contributor => {
            if (!contributor.profile?.url) return;
            const isVc = contributor.type === ActorType.VirtualContributor;
            suggestions.push({
              id: contributor.profile.url,
              displayName: contributor.profile.displayName,
              avatarUrl: contributor.profile.avatar?.uri,
              ...(isVc
                ? { virtualContributor: true }
                : {
                    city: contributor.profile.location?.city,
                    country: contributor.profile.location?.country,
                  }),
            });
          });

          if (suggestions.length === 0) {
            emptyQueries.push(search);
          }

          for (const resolve of resolvers) {
            resolve(suggestions);
          }
        } catch {
          for (const resolve of resolvers) {
            resolve([]);
          }
        }
      }, MENTION_DEBOUNCE_MS);
    });
  };
}
