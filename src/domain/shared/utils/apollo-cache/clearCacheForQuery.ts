import { ApolloCache } from '@apollo/client';

interface CacheWithAccessibleRootQuery<T> extends ApolloCache<T> {
  data: {
    data: {
      ROOT_QUERY: Record<string, unknown>;
    };
  };
}

const clearCacheForQuery = (cache: ApolloCache<unknown>, queryName: string) => {
  const rootQuery = (cache as CacheWithAccessibleRootQuery<unknown>).data.data.ROOT_QUERY;

  const cacheKeys = Object.keys(rootQuery).filter(key => key.startsWith(`${queryName}:`));

  console.log(rootQuery);

  for (const key of cacheKeys) {
    cache.evict({
      id: 'ROOT_QUERY',
      fieldName: key,
    });
  }
};

export default clearCacheForQuery;
