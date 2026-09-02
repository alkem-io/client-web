import { CrdCalendarDialogConnector } from '../../space/timeline/CrdCalendarDialogConnector';

type CrdSubspaceEventsDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Thin alias for the L0 calendar/events dialog connector. Per spec 091 (FR-019)
 * the L1 events surface reuses the L0 timeline component as-is — no separate
 * per-subspace events UI. The underlying `useCalendarEvents` already scopes to
 * the current subspace via `useUrlResolver().spaceId`.
 */
export function CrdSubspaceEventsDialogConnector({ open, onOpenChange }: CrdSubspaceEventsDialogConnectorProps) {
  return <CrdCalendarDialogConnector open={open} onOpenChange={onOpenChange} />;
}
