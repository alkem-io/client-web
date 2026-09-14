import { useEffect } from 'react';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import useCalloutDetails from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useMemoSigningReturnContext } from '@/main/ui/layout/MemoSigningReturnContext';
import { CalloutDeeplinkView } from './CalloutDeeplinkView';

type CrdCalloutDialogFromUrlProps = {
  /** Called when the user closes the dialog (X / Escape). The page route
   *  consumer should navigate back to the parent space/subspace path. */
  onClose: () => void;
};

/**
 * Direct-link route handler for callout URLs (e.g. `…/collaboration/<callout>`,
 * `…/collaboration/<callout>/posts/<postId>`). Reads the callout +
 * contribution ids from `useUrlResolver` and opens the CRD callout detail
 * dialog on top of whatever underlying space/subspace page the consumer
 * renders behind it. Mirrors the MUI `CalloutPage` flow but uses the new
 * CRD dialog so deep links land on the new UI.
 */
export function CrdCalloutDialogFromUrl({ onClose }: CrdCalloutDialogFromUrlProps) {
  const { calloutId, calloutsSetId, contributionId, postId, loading: urlLoading } = useUrlResolver();
  const { restoreIntent, setRestoreIntent } = useMemoSigningReturnContext();

  const { callout, loading: calloutLoading } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification: true,
    skip: !calloutId,
    overrideCalloutSettings: { movable: true },
  });

  useEffect(() => {
    if (!callout || !restoreIntent || restoreIntent.calloutId === callout.id) return;
    setRestoreIntent(current => (current?.attemptId === restoreIntent.attemptId ? undefined : current));
  }, [callout, restoreIntent, setRestoreIntent]);

  // The URL resolver and callout details both have to settle before we can
  // decide whether to render the dialog — until then, defer rendering so the
  // underlying page (rendered by the parent) shows alone.
  if (urlLoading || (calloutLoading && !callout)) {
    return <LoadingSpinner />;
  }

  if (!callout) {
    return null;
  }

  return (
    <CalloutDeeplinkView
      callout={callout}
      contributionId={contributionId}
      postId={postId}
      memoSigningRestore={restoreIntent?.calloutId === callout.id ? restoreIntent : undefined}
      onMemoSigningRestoreConsumed={attemptId =>
        setRestoreIntent(current => (current?.attemptId === attemptId ? undefined : current))
      }
      onClose={onClose}
    />
  );
}
