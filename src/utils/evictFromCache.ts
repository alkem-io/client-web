import { ApolloCache, FetchResult } from '@apollo/client';

/***
 * A **MutationUpdaterFn** function that removes an object from Apollo cache, using the return result of a mutation.
 * The returned data of the mutation must contain a **__typename** and **id** properties
 * @see MutationUpdaterFn
 * @param cache
 * @param mutationResult
 */
function evictFromCache<T = { [key: string]: any }>(cache: ApolloCache<T>, mutationResult: FetchResult<T>): void {
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

    const normalizedId = cache.identify({ id: id, __typename: __typename });
    cache.evict({ id: normalizedId });
    cache.gc();
  }
}
export default evictFromCache;
