import { useV2ResolveQuery } from '@/core/apollo/generated-v2/apollo-hooks';

/** CrdHomePage's host dispatch, using the actual declared homepage carrier only. */
export function useNativeHomepageResolution() {
  const { data, loading, error } = useV2ResolveQuery({
    variables: { url: new URL('/', window.location.origin).href },
  });
  return {
    homepageId: data?.resolve.homepage?.id,
    homepage: data?.resolve.homepage ?? undefined,
    loading,
    error,
  };
}
