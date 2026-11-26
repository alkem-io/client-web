import { ApolloClient, ApolloLink, Observable } from '@apollo/client';
import { GraphQLError, print } from 'graphql';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';

export type CapturedRequest = { operationName: string; variables: Record<string, unknown>; query: string };
export type NativeReplies = Record<string, (variables: Record<string, unknown>) => unknown>;

/**
 * Test-only native client: the real v2 cache (type policies, possible types) behind a link that records every
 * operation and answers it from `replies` by operation name; an operation without a reply fails the request, and a reply
 * that throws a GraphQLError answers with that error.
 */
export const createCapturingClient = (replies: NativeReplies) => {
  const requests: CapturedRequest[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const reply = replies[operation.operationName];
          const timer = setTimeout(() => {
            if (!reply) {
              observer.error(new Error(`Unexpected native operation ${operation.operationName}`));
              return;
            }
            try {
              observer.next({ data: reply(operation.variables) as Record<string, unknown> });
              observer.complete();
            } catch (error) {
              // A reply that throws a GraphQLError is a server error response; anything else fails the transport.
              if (error instanceof GraphQLError) {
                observer.next({ errors: [error] });
                observer.complete();
              } else observer.error(error);
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  return { client, requests };
};
