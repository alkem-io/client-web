import { useUrlResolverLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';

/** The three resource types an Innovation Hub curates (spec FR-016/FR-017). */
export type HubResourceType = 'space' | 'pack' | 'virtualContributor';

export type ResolveHubResourceUrlResult = { kind: 'ok'; id: string } | { kind: 'invalid' };

export type UseResolveHubResourceUrl = {
  resolve: (url: string, resourceType: HubResourceType) => Promise<ResolveHubResourceUrlResult>;
};

/**
 * Resolves a pasted URL to the id of a hub-curatable resource via the existing
 * `urlResolver` query (generalisation of the former space-only hook, FR-017/FR-019):
 * - `space`: an L0 Space URL;
 * - `pack`: an Innovation Library pack URL (`UrlType.InnovationPacks` + `innovationPack`);
 * - `virtualContributor`: a VC profile URL.
 * Anything unresolved, forbidden, or of the wrong type is `invalid` — the form
 * surfaces the existing error pattern.
 */
const useResolveHubResourceUrl = (): UseResolveHubResourceUrl => {
  const [parseUrl] = useUrlResolverLazyQuery();

  const resolve = async (url: string, resourceType: HubResourceType): Promise<ResolveHubResourceUrlResult> => {
    try {
      const { data, error } = await parseUrl({
        variables: { url: url.trim() },
      });

      if (error || !data) {
        return { kind: 'invalid' };
      }

      const result = data.urlResolver;
      if (result.state !== UrlResolverResultState.Resolved) {
        return { kind: 'invalid' };
      }

      if (resourceType === 'space') {
        const space = result.type === UrlType.Space ? result.space : undefined;
        if (!space || space.level !== SpaceLevel.L0 || !space.id) {
          return { kind: 'invalid' };
        }
        return { kind: 'ok', id: space.id };
      }

      if (resourceType === 'pack') {
        const pack = result.type === UrlType.InnovationPacks ? result.innovationPack : undefined;
        if (!pack?.id) {
          return { kind: 'invalid' };
        }
        return { kind: 'ok', id: pack.id };
      }

      const virtualContributor = result.type === UrlType.VirtualContributor ? result.virtualContributor : undefined;
      if (!virtualContributor?.id) {
        return { kind: 'invalid' };
      }
      return { kind: 'ok', id: virtualContributor.id };
    } catch {
      return { kind: 'invalid' };
    }
  };

  return { resolve };
};

export default useResolveHubResourceUrl;
