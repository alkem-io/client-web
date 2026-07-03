import { useApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { CollaboraServiceAvailableDocument } from '@/core/apollo/generated/apollo-hooks';
import type {
  CollaboraServiceAvailableQuery,
  CollaboraServiceAvailableQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
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
 * we run the **`collaboraServiceAvailable`** query. Unlike the editor-URL query, this is
 * side-effect-free — the server just pings wopi-service `/health`, minting NO token and recording
 * NO analytics (the earlier editor-URL probe spammed `COLLABORA_DOCUMENT_OPENED` events + tokens).
 * `false` (or a failed query) means a service is unreachable → `serviceUnavailable`; `true` means
 * the backend is fine and the lingering "unsaved" is just the cosmetic flag → stay quiet.
 * Re-checks every {@link SAVE_HEALTH_PROBE_INTERVAL_MS}; auto-clears once saves resume or health
 * recovers.
 *
 * `serviceUnavailable` feeds the single shared connection indicator in the footer (as a `service`
 * disconnect) plus the top alert, so a WOPI/save-path outage looks consistent with other drops.
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
        const { data, error } = await client.query<
          CollaboraServiceAvailableQuery,
          CollaboraServiceAvailableQueryVariables
        >({
          query: CollaboraServiceAvailableDocument,
          variables: { collaboraDocumentId },
          fetchPolicy: 'network-only',
          // Silent background health check — failures drive our own UI, never the global toast.
          context: { skipGlobalErrorHandler: true },
        });
        // A reachable-but-false result, or a failed query, both mean a service is down.
        setServiceUnavailable(Boolean(error) || data?.collaboraServiceAvailable === false);
      } catch {
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
