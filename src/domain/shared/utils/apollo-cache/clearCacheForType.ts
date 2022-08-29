import { get, pick } from 'lodash';
import { ApolloCache } from '@apollo/client';
import { Query } from '../../../../models/graphql-schema';

interface CacheWithAccessibleData<T> extends ApolloCache<T> {
  data: {
    data: Record<string, unknown>;
  };
}

const clearCacheForType = (cache: ApolloCache<unknown>, typeName: string) => {
  const keys = Object.keys((cache as CacheWithAccessibleData<unknown>).data.data);
  const ids = keys.filter(key =>
    key.startsWith(typeName)
  );

  for (const id of ids) {
    cache.evict({ id });
  }
};
export default clearCacheForType;
// may be used in the future
const getCacheByTypename = (cache: ApolloCache<unknown>, typeName: string) => {
  const data = (cache as CacheWithAccessibleData<unknown>).data.data;
  const ids = Object.keys(data).filter(key =>
    key.startsWith(typeName)
  );
  return pick(data, ids);
};

// may be used in the future
function clearCache<
  a extends keyof Query
  >(
  cache: ApolloCache<unknown>,
  key1: a
): boolean;
function clearCache<
  a extends keyof Query,
  b extends keyof Query[a]
  >(
  cache: ApolloCache<unknown>,
  key1: a,
  key2?: b
): boolean;
function clearCache<
  a extends keyof Query,
  b extends keyof Query[a],
  c extends keyof Query[a][b]
  >(
  cache: ApolloCache<unknown>,
  key1: a,
  key2?: b,
  key3?: c): boolean;
function clearCache<
  a extends keyof Query,
  b extends keyof Query[a],
  c extends keyof Query[a][b],
  d extends keyof Query[a][b][c]
  >(
  cache: ApolloCache<unknown>,
  key1: a,
  key2?: b,
  key3?: c,
  key4?: d
): boolean;
function clearCache(
  cache: ApolloCache<unknown>,
  path: string,
  ...paths: string[]
): boolean {
  const pathSlices = [path, ...paths].filter(Boolean);
  console.log(pathSlices);

  const data =  (cache as CacheWithAccessibleData<unknown>).data.data;
  console.log(data);

  const plucked = get(data, pathSlices);
  console.log(plucked);

  return false;
}

