import { useChatRecipientDirectoryQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { ShareUser } from '@/crd/forms/UserSelector';

export function useChatRecipientDirectory(terms: string, currentActorId?: string) {
  const trimmed = terms.trim();
  const { data, loading, error } = useChatRecipientDirectoryQuery({
    variables: { terms: trimmed },
    skip: !trimmed,
  });

  const searchResults: ShareUser[] =
    trimmed && !loading && !error
      ? (data?.actors.edges ?? []).flatMap(({ node }) => {
          const { id, about } = node;
          if (!about || id === currentActorId) return [];

          const location = about.location as { city?: unknown; country?: unknown } | null | undefined;
          return [
            {
              id,
              displayName: about.displayName,
              avatarUrl: about.avatar?.file?.url ?? undefined,
              city: typeof location?.city === 'string' ? location.city : undefined,
              country: typeof location?.country === 'string' ? location.country : undefined,
            },
          ];
        })
      : [];

  return {
    searchResults,
    loading: Boolean(trimmed) && loading,
    error: trimmed && !loading ? error : undefined,
  };
}
