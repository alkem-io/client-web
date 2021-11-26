import { ApolloCache, FetchResult } from '@apollo/client';

/***
 * A **MutationUpdaterFn** function that removes an object from Apollo cache, using the return result of a mutation.
 * The returned data of the mutation must contain a **__typename** and **id** properties
 * @see MutationUpdaterFn
 * @param cache
 * @param mutationResult
 */
function removeFromCache<T = { [key: string]: any }>(cache: ApolloCache<T>, mutationResult: FetchResult<T>): void {
  const data = mutationResult.data;
  if (data) {
    const mutationResultKey = Object.keys(data).filter(x => x !== '__typename');
    if (mutationResultKey.length !== 1) {
      throw Error(
        `mutationResult expected to have only '__typename' and mutation name property: (${mutationResultKey.join(
          ','
        )} found instead.)`
      );
    }

    const [mutationNameKey] = mutationResultKey;

    const { id, __typename } = data[mutationNameKey];

    if (!id) {
      throw Error("'id' attribute not found in the mutation object");
    }

    if (!__typename) {
      throw Error("'__typename' attribute not found in the mutation object");
    }

    evictFromCache(cache, id, __typename);
  }
}
export default removeFromCache;

/***
 * Removes entity from cache
 * @param cache
 * @param id
 * @param typeName
 */
export function evictFromCache<T = { [key: string]: any }>(cache: ApolloCache<T>, id: string, typeName: string) {
  const normalizedId = cache.identify({ id: id, __typename: typeName });

  if (!normalizedId) {
    throw new Error(`entity with id ${id} and typename ${typeName} not found in cache`);
  }

  cache.evict({ id: normalizedId });
  cache.gc();
}
