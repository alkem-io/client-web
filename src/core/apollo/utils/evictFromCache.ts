import { type ApolloCache, useApolloClient } from '@apollo/client';

/***
 * Removes entity from cache
 * @param cache
 * @param id
 * @param typeName
 */
export function evictFromCache<T = { [key: string]: unknown }>(cache: ApolloCache<T>, id: string, typeName: string) {
  const normalizedId = cache.identify({ id: id, __typename: typeName });

  if (!normalizedId) {
    throw new Error(`entity with id ${id} and typename ${typeName} not found in cache`);
  }

  cache.evict({ id: normalizedId });
  cache.gc();
}

export const useApolloCache = () => {
  const apolloClient = useApolloClient();

  const handleEvictFromCache = (id: string | undefined, typeName: string) => {
    if (!id) {
      return;
    }
    evictFromCache(apolloClient.cache, id, typeName);
  };

  return {
    evictFromCache: handleEvictFromCache,
  };
};
