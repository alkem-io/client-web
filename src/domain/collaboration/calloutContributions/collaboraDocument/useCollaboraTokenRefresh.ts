import { useApolloClient } from '@apollo/client';
import { type RefObject, useEffect, useRef } from 'react';
import {
  accessTokenFromEditorUrl,
  editorOrigin,
  fetchCollaboraEditorUrl,
  graphQLErrorCode,
} from './collaboraEditorSession';
import { isMessageFromIframe, parseCollaboraMessage } from './collaboraPostMessage';

type Options = {
  /** Called with the fresh absolute-epoch `accessTokenTTL` after a successful in-place refresh. */
  onRefreshed?: (accessTokenTTL: number) => void;
  /** Called if re-issuing the token failed; the caller classifies terminal vs recoverable. */
  onError?: (code: string | undefined, message: string) => void;
};

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
    let cancelled = false;
    const handler = async (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!isMessageFromIframe(event, iframe)) return;
      if (parseCollaboraMessage(event.data)?.MessageId !== 'App_TokenExpiring') return;
      if (refreshingRef.current) return; // App_TokenExpiring repeats every 2 min — refresh once
      refreshingRef.current = true;
      try {
        const { data, error } = await fetchCollaboraEditorUrl(client, collaboraDocumentId);
        if (cancelled) return; // unmounted / document changed mid-request
        // The iframe may have remounted during the await (e.g. a user-initiated reconnect bumped
        // the nonce), so re-read the ref: posting the fresh token to the old, detached
        // contentWindow — or calling onRefreshed for a session that no longer exists — would be
        // wrong. Bail if it is no longer the same iframe we validated the message against.
        if (iframeRef.current !== iframe) return;
        if (error) {
          onErrorRef.current?.(graphQLErrorCode(error), error.message);
          return;
        }
        const result = data?.collaboraEditorUrl;
        const token = result ? accessTokenFromEditorUrl(result.editorUrl) : undefined;
        const target = iframe?.contentWindow;
        const origin = result ? editorOrigin(result.editorUrl) : undefined;
        // Require a resolvable origin — never broadcast the fresh token with a '*' target.
        if (result && token && target && origin) {
          target.postMessage(
            JSON.stringify({
              MessageId: 'Reset_Access_Token',
              Values: { token, ttl: result.accessTokenTTL },
            }),
            origin
          );
          onRefreshedRef.current?.(result.accessTokenTTL);
        }
      } catch (err) {
        if (!cancelled) {
          onErrorRef.current?.(graphQLErrorCode(err), err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        refreshingRef.current = false;
      }
    };

    window.addEventListener('message', handler);
    return () => {
      cancelled = true;
      window.removeEventListener('message', handler);
    };
  }, [iframeRef, client, collaboraDocumentId]);
}
