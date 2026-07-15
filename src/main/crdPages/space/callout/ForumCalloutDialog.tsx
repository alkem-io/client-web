import useCalloutDetails from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

type ForumCalloutDialogProps = {
  /** The callout to open, or undefined when the dialog is closed. */
  calloutId: string | undefined;
  calloutsSetId: string | undefined;
  onClose: () => void;
};

/**
 * Loads the full callout model for a forum row on demand and mounts the same
 * detail dialog the feed uses. The forum list only holds light fields, so the
 * heavy CalloutDetails query fires only once a row is actually opened.
 */
export function ForumCalloutDialog({ calloutId, calloutsSetId, onClose }: ForumCalloutDialogProps) {
  const { callout } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification: true,
    skip: !calloutId,
  });

  if (!calloutId || !callout) return null;

  return (
    <CalloutDetailDialogConnector
      open={true}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      callout={callout}
    />
  );
}
