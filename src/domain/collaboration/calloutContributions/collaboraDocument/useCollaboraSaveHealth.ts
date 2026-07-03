import { useApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import type { CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables } from '@/core/apollo/generated/graphql-schema';
import type { CollaboraSaveStatus } from '@/crd/components/collabora/CollaboraCollabFooter';

/**
 * How long the document may stay unsaved before we suspect the save path is broken and start
 * probing. A short window is safe because the probe *confirms* the outage before we surface
 * anything — so a lingering "unsaved" flag (client-web#9973) never produces a false alarm.
 */
export const SAVE_STALL_TRIGGER_MS = 3_000;

/** How often we re-check backend reachability while the document remains unsaved — kept short so
 *  recovery (the service coming back) is picked up quickly and the outage state clears promptly. */
export const SAVE_HEALTH_PROBE_INTERVAL_MS = 3_000;

/**
 * Detects a backend save-path outage (e.g. the WOPI service is down) while editing.
 *
 * A WOPI outage is *silent* from the client: Collabora keeps the document editable, buffers the
 * changes, and does not reliably report a save failure — it just leaves the doc "modified". And
 * because Collabora's modified flag can linger even when saves succeed (see client-web#9973), a
 * "unsaved too long ⇒ service down" heuristic alone would false-positive during normal editing.
 *
 * So we confirm with a **probe**: once the document has been unsaved past {@link SAVE_STALL_TRIGGER_MS},
 * we re-run the editor-URL query (which traverses server → wopi-service). A failure means a
 * service really is unreachable → `serviceUnavailable`; a success means the backend is fine and
 * the lingering "unsaved" is just the cosmetic flag → stay quiet. Re-checks every
 * {@link SAVE_HEALTH_PROBE_INTERVAL_MS} and auto-clears once saves resume or the probe recovers.
 *
 * `serviceUnavailable` feeds the single shared connection indicator in the footer (as a `service`
 * disconnect), so a WOPI/save-path outage looks the same as a network/Collabora drop rather than
 * a bespoke banner.
 */
export function useCollaboraSaveHealth(
  collaboraDocumentId: string,
  saveStatus: CollaboraSaveStatus
): { serviceUnavailable: boolean } {
  const client = useApolloClient();
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const probingRef = useRef(false);

  // Any non-"saved" state (unsaved / saving / error) means work has not been persisted yet.
  const unsaved = saveStatus !== 'saved';

  useEffect(() => {
    if (!unsaved) {
      setServiceUnavailable(false);
      return;
    }

    const probe = async () => {
      if (probingRef.current) return;
      probingRef.current = true;
      try {
        const { error } = await client.query<CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables>({
          query: CollaboraEditorUrlDocument,
          variables: { collaboraDocumentId },
          fetchPolicy: 'network-only',
          // Silent background health check — we handle failure ourselves (the banner); it must
          // not surface the app's global error toast (would spam "Request failed with 503").
          context: { skipGlobalErrorHandler: true },
        });
        setServiceUnavailable(Boolean(error));
      } catch {
        // Network / server / wopi-service failure — a service is unreachable.
        setServiceUnavailable(true);
      } finally {
        probingRef.current = false;
      }
    };

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      probe();
      interval = setInterval(probe, SAVE_HEALTH_PROBE_INTERVAL_MS);
    }, SAVE_STALL_TRIGGER_MS);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [unsaved, client, collaboraDocumentId]);

  return { serviceUnavailable };
}
