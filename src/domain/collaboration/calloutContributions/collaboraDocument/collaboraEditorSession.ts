import type { ApolloClient, ApolloQueryResult } from '@apollo/client';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import type { CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables } from '@/core/apollo/generated/graphql-schema';

/**
 * Apollo context that opts a query out of the app's global error toast — for silent background
 * Collabora queries whose failures are reported through the editor's own UI, not a toast.
 */
export const SILENT_QUERY_CONTEXT = { skipGlobalErrorHandler: true } as const;

/** Extract the Alkemio error code (`extensions.code`) from an Apollo/GraphQL error, if present. */
export function graphQLErrorCode(error: unknown): string | undefined {
  const graphQLErrors = (error as { graphQLErrors?: Array<{ extensions?: { code?: string } }> } | undefined)
    ?.graphQLErrors;
  return graphQLErrors?.[0]?.extensions?.code;
}

/**
 * Fetch a freshly-issued editor URL + token TTL for a document. Always `network-only` (each call
 * must mint a new token) and silent (see {@link SILENT_QUERY_CONTEXT}). Shared by the initial
 * editor mount and the in-place token refresh.
 */
export function fetchCollaboraEditorUrl(
  client: ApolloClient<object>,
  collaboraDocumentId: string
): Promise<ApolloQueryResult<CollaboraEditorUrlQuery>> {
  return client.query<CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables>({
    query: CollaboraEditorUrlDocument,
    variables: { collaboraDocumentId },
    fetchPolicy: 'network-only',
    context: SILENT_QUERY_CONTEXT,
  });
}
