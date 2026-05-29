import { useUrlResolverLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';

export type ResolveSpaceUrlResult = { kind: 'ok'; spaceId: string } | { kind: 'invalid' };

export type UseResolveSpaceUrl = {
  resolve: (url: string) => Promise<ResolveSpaceUrlResult>;
};

const useResolveSpaceUrl = (): UseResolveSpaceUrl => {
  const [parseUrl] = useUrlResolverLazyQuery();

  const resolve = async (url: string): Promise<ResolveSpaceUrlResult> => {
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
      if (result.type !== UrlType.Space) {
        return { kind: 'invalid' };
      }
      const space = result.space;
      if (!space || space.level !== SpaceLevel.L0 || !space.id) {
        return { kind: 'invalid' };
      }

      return { kind: 'ok', spaceId: space.id };
    } catch {
      return { kind: 'invalid' };
    }
  };

  return { resolve };
};

export default useResolveSpaceUrl;
