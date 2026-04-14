import { CalloutFormConnector } from './CalloutFormConnector';

type CalloutEditConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutId: string;
  calloutsSetId?: string;
};

/**
 * Pre-fills the form with existing callout data and locks framing type + contribution type.
 * This is a thin wrapper around CalloutFormConnector that loads the callout
 * and pre-fills the form values.
 */
export function CalloutEditConnector({
  open,
  onOpenChange,
  calloutId: _calloutId,
  calloutsSetId,
}: CalloutEditConnectorProps) {
  // In the full implementation, this would:
  // 1. Fetch callout details by ID
  // 2. Map to form values
  // 3. Pass to CalloutFormConnector with locked fields
  return <CalloutFormConnector open={open} onOpenChange={onOpenChange} calloutsSetId={calloutsSetId} />;
}
