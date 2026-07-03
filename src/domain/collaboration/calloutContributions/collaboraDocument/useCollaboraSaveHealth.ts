import { useState } from 'react';
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
  // Params kept for signature stability (used again once probing is re-enabled); unused while off.
  _collaboraDocumentId: string,
  _saveStatus: CollaboraSaveStatus
): { serviceUnavailable: boolean } {
  const [serviceUnavailable] = useState(false);

  // ⚠️ PROBE DISABLED (2026-07-03). The probe re-ran `collaboraEditorUrl`, but that resolver has
  // SIDE EFFECTS — it mints a WOPI token AND records a `COLLABORA_DOCUMENT_OPENED` analytics
  // contribution (server `collabora.document.resolver.queries.ts`). At a 3s interval this spammed
  // tokens + fake "document opened" events (confirmed in server logs) and churned WOPI
  // locks/sessions. A health check must be side-effect-free, and there is no such client query to
  // swap in. Re-enable once we have a proper detection channel — either a lightweight backend
  // health query (server + wopi-service) or a Collabora save-failure postMessage. Until then this
  // returns a constant `false` (WOPI-outage detection is off; network/token/Collabora drops are
  // unaffected). See workspace#015 spec (2026-07-03 debugging note).
  return { serviceUnavailable };
}
