import { ApolloProvider } from '@apollo/client';
import { createContext, type PropsWithChildren, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { createV2ApolloLifetime } from './createV2ApolloClient';

const ScopeTransitionContext = createContext<ReturnType<typeof createV2ApolloLifetime> | undefined>(undefined);
export const useInvalidateV2Scope = () => {
  const lifetime = useContext(ScopeTransitionContext);
  if (!lifetime) throw new Error('The Apollo lifetime provider is not mounted');
  return lifetime.invalidate;
};

export const useRetireV2ForNavigation = () => {
  const lifetime = useContext(ScopeTransitionContext);
  if (!lifetime) throw new Error('The Apollo lifetime provider is not mounted');
  return lifetime.retireForNavigation;
};

type V2ApolloProviderProps = PropsWithChildren<{
  uri: string;
}>;

export const V2ApolloProvider = ({ uri, children }: V2ApolloProviderProps) => {
  const [lifetime] = useState(() => createV2ApolloLifetime(uri));
  const snapshot = useSyncExternalStore(lifetime.subscribe, lifetime.getSnapshot);
  useEffect(() => lifetime.retain(), [lifetime]);
  return (
    <ScopeTransitionContext value={lifetime}>
      <ApolloProvider key={snapshot.revision} client={snapshot.client}>
        {children}
      </ApolloProvider>
    </ScopeTransitionContext>
  );
};
