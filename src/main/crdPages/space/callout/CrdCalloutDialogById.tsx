import { useEffect, useRef } from 'react';
import useCalloutDetails from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

type CrdCalloutDialogByIdProps = {
  /** Callout to open. When undefined nothing renders. */
  calloutId: string | undefined;
  calloutsSetId: string | undefined;
  /** Fired once the callout details have loaded — lets the opener dismiss any
   *  intermediate UI (e.g. the Post Index dialog) without a loading flash. */
  onLoaded?: () => void;
  /** Fired when the user closes the callout dialog. */
  onClose: () => void;
};

/**
 * Opens the CRD callout detail dialog for a given callout id **in place**, the
 * same way the feed's `LazyCalloutItem` does — via local state, with no route
 * navigation. This is the cheap path: only that one callout's details are
 * fetched. It deliberately avoids the `…/collaboration/:calloutNameId` route,
 * which remounts the whole tabbed space page and refetches every tab (the bad
 * UX the Post Index used to trigger by navigating to the callout's own URL).
 */
export function CrdCalloutDialogById({ calloutId, calloutsSetId, onLoaded, onClose }: CrdCalloutDialogByIdProps) {
  const { callout } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification: true,
    skip: !calloutId,
  });

  // Fire `onLoaded` exactly once per callout — when its details first resolve —
  // rather than on every render the callout stays loaded.
  const loadedFor = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (callout && loadedFor.current !== callout.id) {
      loadedFor.current = callout.id;
      onLoaded?.();
    }
    if (!calloutId) {
      loadedFor.current = undefined;
    }
  }, [callout, calloutId, onLoaded]);

  // While the details load, render nothing — the opener keeps its own UI up so
  // there is no spinner flash; the dialog appears once `callout` resolves.
  if (!callout) {
    return null;
  }

  return (
    <CalloutDetailDialogConnector
      open={true}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
      callout={callout}
    />
  );
}
