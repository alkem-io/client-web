import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
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
    // Scope description/reference uploads to the callout's own framing bucket (where an editor has
    // permanent FileUpload), not the ambient space bucket. Mirrors the legacy MUI `EditCalloutDialog`
    // (`locationType="callout"`). Create mode keeps the ambient space bucket + temporaryLocation.
    <StorageConfigContextProvider locationType="callout" calloutId={calloutId} skip={!open}>
      <CalloutFormConnector
        open={open}
        onOpenChange={onOpenChange}
        mode="edit"
        calloutId={calloutId}
        calloutsSetId={calloutsSetId}
        editCallout={editCallout}
      />
    </StorageConfigContextProvider>
  );
}
