import { useApolloClient } from '@apollo/client';
import { type RefObject, useEffect, useRef } from 'react';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import type { CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables } from '@/core/apollo/generated/graphql-schema';

type Options = {
  /** Called with the fresh absolute-epoch `accessTokenTTL` after a successful in-place refresh. */
  onRefreshed?: (accessTokenTTL: number) => void;
  /** Called if re-issuing the token failed; the caller classifies terminal vs recoverable. */
  onError?: (code: string | undefined, message: string) => void;
};

/** Extract the `access_token` query param from a Collabora editor URL. */
function accessTokenFromEditorUrl(editorUrl: string): string | undefined {
  try {
    return new URL(editorUrl).searchParams.get('access_token') ?? undefined;
  } catch {
    return undefined;
  }
}

/** The Collabora editor origin, used as the postMessage target origin (falls back to '*'). */
function editorOrigin(editorUrl: string): string {
  try {
    return new URL(editorUrl).origin;
  } catch {
    return '*';
  }
}

function parseMessageId(raw: unknown): string | undefined {
  const value = typeof raw === 'string' ? safeParse(raw) : raw;
  if (value && typeof value === 'object' && 'MessageId' in value) {
    const id = (value as { MessageId?: unknown }).MessageId;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
}
function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function graphQLErrorCode(error: unknown): string | undefined {
  const graphQLErrors = (error as { graphQLErrors?: Array<{ extensions?: { code?: string } }> } | undefined)
    ?.graphQLErrors;
  return graphQLErrors?.[0]?.extensions?.code;
}

/**
 * Refreshes the WOPI access token **in place** — no iframe remount, no reconnection, no lost
 * edits — using Collabora's documented handshake: Collabora emits `App_TokenExpiring` ~15 min
 * before the token expires (and every 2 min after), and the host replies with
 * `Reset_Access_Token` carrying a fresh token, which Collabora adopts for all subsequent WOPI
 * traffic. This makes token expiry invisible to the user, and is strictly better than detecting
 * expiry and forcing a lossy remount (the monitor's TTL timer is kept only as a fallback).
 *
 * See https://sdk.collaboraonline.com/docs/postmessage_api.html
 */
export function useCollaboraTokenRefresh(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  collaboraDocumentId: string,
  { onRefreshed, onError }: Options = {}
): void {
  const client = useApolloClient();
  const refreshingRef = useRef(false);
  // Hold the latest callbacks in refs so the message listener stays subscribed across renders.
  const onRefreshedRef = useRef(onRefreshed);
  onRefreshedRef.current = onRefreshed;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;
      if (parseMessageId(event.data) !== 'App_TokenExpiring') return;
      if (refreshingRef.current) return; // App_TokenExpiring repeats every 2 min — refresh once
      refreshingRef.current = true;
      try {
        const { data, error } = await client.query<CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables>({
          query: CollaboraEditorUrlDocument,
          variables: { collaboraDocumentId },
          fetchPolicy: 'network-only',
          // Background refresh — failures are handled via onError; don't show the global toast.
          context: { skipGlobalErrorHandler: true },
        });
        if (error) {
          onErrorRef.current?.(graphQLErrorCode(error), error.message);
          return;
        }
        const result = data?.collaboraEditorUrl;
        const token = result ? accessTokenFromEditorUrl(result.editorUrl) : undefined;
        const target = iframe.contentWindow;
        if (result && token && target) {
          target.postMessage(
            JSON.stringify({
              MessageId: 'Reset_Access_Token',
              Values: { token, ttl: result.accessTokenTTL },
            }),
            editorOrigin(result.editorUrl)
          );
          onRefreshedRef.current?.(result.accessTokenTTL);
        }
      } catch (err) {
        onErrorRef.current?.(graphQLErrorCode(err), err instanceof Error ? err.message : 'Unknown error');
      } finally {
        refreshingRef.current = false;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [iframeRef, client, collaboraDocumentId]);
}
