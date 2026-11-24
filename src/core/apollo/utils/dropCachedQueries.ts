import type { ApolloCache } from '@apollo/client';

/**
 * Empties the cache: every query result, and every normalized entity behind
 * them. Evicting the query root alone is not enough, because a refetched query
 * re-links the old entities and a later cache-first read is then served their
 * stale fields (e.g. `authorization.myPrivileges`).
 *
 * Call it inside `client.refetchQueries({ updateCache })` or a mutation's
 * `update`: queries on screen then keep their data until their refetch lands.
 */
export const dropCachedQueries = (cache: ApolloCache<unknown>): void => {
  cache.evict({ id: 'ROOT_QUERY' });
  cache.gc();
};
