import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { CalloutFormConnector } from './CalloutFormConnector';

type CalloutEditConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutId: string;
  calloutsSetId?: string;
  /**
   * The fully-loaded callout from the parent (`LazyCalloutItem`'s
   * `useCalloutInView`). Threaded down so the form's whiteboard "Open" button
   * (T048) can launch the collaborative `CrdWhiteboardView` against the actual
   * server whiteboard — `useCalloutContentQuery` doesn't return the rich
   * `WhiteboardDetails` shape that dialog needs.
   */
  editCallout?: CalloutDetailsModelExtended;
};

/**
 * Thin wrapper that renders `CalloutFormConnector` in edit mode. Pre-fetching
 * the callout and mapping it to form values is handled inside
 * `CalloutFormConnector` itself (wired in P3 — spec T041).
 */
export function CalloutEditConnector({
  open,
  onOpenChange,
  calloutId,
  calloutsSetId,
  editCallout,
}: CalloutEditConnectorProps) {
  return (
    <CalloutFormConnector
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      calloutId={calloutId}
      calloutsSetId={calloutsSetId}
      editCallout={editCallout}
    />
  );
}
