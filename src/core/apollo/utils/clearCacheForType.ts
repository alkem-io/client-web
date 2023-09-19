import { ApolloCache } from '@apollo/client';

interface CacheWithAccessibleData<T> extends ApolloCache<T> {
  data: {
    data: Record<string, unknown>;
  };
}

const clearCacheForType = (cache: ApolloCache<unknown>, typeName: string) => {
  const ids = Object.keys((cache as CacheWithAccessibleData<unknown>).data.data).filter(key =>
    key.startsWith(`${typeName}:`)
  );

  for (const id of ids) {
    cache.evict({ id });
  }
};

export default clearCacheForType;
