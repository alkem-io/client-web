import type { QueryResult } from '@apollo/client';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useV2FoundationQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { V2FoundationQuery, V2FoundationQueryVariables } from '@/core/apollo/generated-v2/graphql-schema';
import { isSessionStoreUnavailable } from '@/core/apollo/v2/isSessionStoreUnavailable';

export type NativeFoundationState = Pick<
  QueryResult<V2FoundationQuery, V2FoundationQueryVariables>,
  'data' | 'loading' | 'error' | 'refetch'
>;
export const NativeFoundationContext = createContext<NativeFoundationState | undefined>(undefined);

export const useNativeFoundation = () => {
  const state = useContext(NativeFoundationContext);
  if (!state) throw new Error('The foundation observation is not mounted');
  return state;
};

export function NativeFoundationProvider({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const query = useV2FoundationQuery({
    variables: {
      origin: new URL('/', window.location.origin).href,
      resolveHomepage: pathname === '/' || pathname === '/home',
    },
    notifyOnNetworkStatusChange: true,
  });
  const data = query.data ?? (isSessionStoreUnavailable(query.error) ? query.previousData : undefined);
  return (
    <NativeFoundationContext value={{ data, loading: query.loading, error: query.error, refetch: query.refetch }}>
      {children}
    </NativeFoundationContext>
  );
}
