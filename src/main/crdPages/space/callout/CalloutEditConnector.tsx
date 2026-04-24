import { CalloutFormConnector } from './CalloutFormConnector';

type CalloutEditConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutId: string;
  calloutsSetId?: string;
};

/**
 * Thin wrapper that renders `CalloutFormConnector` in edit mode. Pre-fetching
 * the callout and mapping it to form values is handled inside
 * `CalloutFormConnector` itself (wired in P3 — spec T041).
 */
export function CalloutEditConnector({ open, onOpenChange, calloutId, calloutsSetId }: CalloutEditConnectorProps) {
  return (
    <CalloutFormConnector
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      calloutId={calloutId}
      calloutsSetId={calloutsSetId}
    />
  );
}
