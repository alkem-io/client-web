import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutCollaborationPermissions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions';
import useCalloutContributions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';
import type { CalloutMoveActions } from '@/main/crdPages/space/hooks/useCrdCalloutMoveActions';
import { getCalloutContributionType, mapCalloutDetailsToDialogData } from '../dataMappers/calloutDataMapper';
import { type ContributionCardData, mapAnyContributionToCardData } from '../dataMappers/contributionDataMapper';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';
import { CalloutPollConnector } from './CalloutPollConnector';
import { CalloutSettingsConnector } from './CalloutSettingsConnector';
import { CalloutShareDialog } from './CalloutShareDialog';
import { CallToActionFramingConnector } from './CallToActionFramingConnector';
import { ContributionGridConnector } from './ContributionGridConnector';
import { MediaGalleryFramingConnector } from './MediaGalleryFramingConnector';
import { MemoContributionAddConnector } from './MemoContributionAddConnector';
import { MemoContributionConnector } from './MemoContributionConnector';
import { MemoFramingConnector } from './MemoFramingConnector';
import { WhiteboardContributionAddConnector } from './WhiteboardContributionAddConnector';
import { WhiteboardContributionConnector } from './WhiteboardContributionConnector';
import { WhiteboardFramingConnector } from './WhiteboardFramingConnector';

type CalloutDetailDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailsModelExtended;
  /** If set, the matching contribution dialog opens immediately on top of the callout dialog.
   *  Routed to whiteboard or memo overlay based on `callout.settings.contribution.type`. */
  initialContributionId?: string;
  /** For memo contributions only: the underlying memo id (the contribution wrapper id goes into `initialContributionId`). */
  initialMemoId?: string;
  /** Move-action prop bag forwarded from the feed (plan T064) so the detail-dialog's 3-dots menu offers the same Move items as the card's. */
  moveActions?: CalloutMoveActions;
};

function ContributionsSlot({
  callout,
  open,
  onContributionClick,
  onContributionCreated,
}: {
  callout: CalloutDetailsModelExtended;
  open: boolean;
  onContributionClick?: (id: string, memoId?: string) => void;
  onContributionCreated?: () => void;
}) {
  const contributionType = getCalloutContributionType(callout);
  const { canCreateContribution } = useCalloutCollaborationPermissions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
  });

  const {
    inViewRef,
    contributions: { items },
    loading,
  } = useCalloutContributions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
    skip: !open || !contributionType || !callout.settings.contribution.enabled,
  });

  if (!contributionType || !callout.settings.contribution.enabled) {
    return null;
  }

  const mapped = items.map(item => mapAnyContributionToCardData(item)).filter(Boolean) as ContributionCardData[];

  const trailingSlot = canCreateContribution ? (
    contributionType === CalloutContributionType.Whiteboard ? (
      <WhiteboardContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />
    ) : contributionType === CalloutContributionType.Memo ? (
      <MemoContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />
    ) : null
  ) : null;

  return (
    <div ref={inViewRef}>
      {!loading && (
        <ContributionGridConnector
          contributions={mapped}
          onContributionClick={onContributionClick}
          trailingSlot={trailingSlot}
        />
      )}
    </div>
  );
}

export function CalloutDetailDialogConnector({
  open,
  onOpenChange,
  callout,
  initialContributionId,
  initialMemoId,
  moveActions,
}: CalloutDetailDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const contributionType = getCalloutContributionType(callout);
  const initialIsMemo = contributionType === CalloutContributionType.Memo;

  const [whiteboardContributionId, setWhiteboardContributionId] = useState<string | undefined>(
    initialIsMemo ? undefined : initialContributionId
  );
  const [memoContributionId, setMemoContributionId] = useState<string | undefined>(
    initialIsMemo ? initialContributionId : undefined
  );
  const [memoId, setMemoId] = useState<string | undefined>(initialMemoId);
  const [framingMemoOpen, setFramingMemoOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [fetchFramingMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });
  const framingRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CrdMemoDialog writes the editor content to Apollo cache on close for instant preview updates.
  // Schedule a delayed server fetch as a safety net to reconcile with the canonical server markdown
  // once Hocuspocus has persisted (~2s lag).
  const handleFramingMemoClose = () => {
    const fmId = callout.framing.memo?.id;
    if (framingRefreshRef.current) {
      clearTimeout(framingRefreshRef.current);
      framingRefreshRef.current = null;
    }
    if (fmId) {
      framingRefreshRef.current = setTimeout(() => {
        void fetchFramingMarkdown({ variables: { id: fmId } });
        framingRefreshRef.current = null;
      }, 2500);
    }
    setFramingMemoOpen(false);
  };

  // Clear the pending refresh on unmount — otherwise an unmount during the
  // 2.5s window still fires the delayed fetch (wasted request, possible cache
  // population for a component that's gone).
  useEffect(() => {
    return () => {
      if (framingRefreshRef.current) {
        clearTimeout(framingRefreshRef.current);
        framingRefreshRef.current = null;
      }
    };
  }, []);

  // Sync when the parent passes a new initial contribution ID (e.g. feed thumbnail click)
  useEffect(() => {
    if (!initialContributionId) return;
    if (contributionType === CalloutContributionType.Memo) {
      setMemoContributionId(initialContributionId);
      setMemoId(initialMemoId);
    } else {
      setWhiteboardContributionId(initialContributionId);
    }
  }, [initialContributionId, initialMemoId, contributionType]);

  const hasPoll = callout.framing.type === CalloutFramingType.Poll;
  const pollSlot = hasPoll ? <CalloutPollConnector callout={callout} /> : undefined;

  const hasWhiteboardFraming = callout.framing.type === CalloutFramingType.Whiteboard && !!callout.framing.whiteboard;
  const whiteboardFramingSlot = hasWhiteboardFraming ? <WhiteboardFramingConnector callout={callout} /> : undefined;

  const hasMemoFraming = callout.framing.type === CalloutFramingType.Memo && !!callout.framing.memo;
  const memoFramingSlot = hasMemoFraming ? (
    <MemoFramingConnector callout={callout} onOpen={() => setFramingMemoOpen(true)} />
  ) : undefined;
  const framingMemoId = callout.framing.memo?.id;

  const hasMediaGalleryFraming =
    callout.framing.type === CalloutFramingType.MediaGallery && !!callout.framing.mediaGallery;
  const mediaGalleryFramingSlot = hasMediaGalleryFraming ? (
    <MediaGalleryFramingConnector callout={callout} />
  ) : undefined;

  const hasCallToAction = callout.framing.type === CalloutFramingType.Link && !!callout.framing.link;
  const callToActionFramingSlot = hasCallToAction ? <CallToActionFramingConnector callout={callout} /> : undefined;

  const handleContributionClick = (contributionId: string, clickedMemoId?: string) => {
    if (contributionType === CalloutContributionType.Memo) {
      setMemoContributionId(contributionId);
      setMemoId(clickedMemoId);
    } else {
      setWhiteboardContributionId(contributionId);
    }
  };

  const hasContributionType = Boolean(getCalloutContributionType(callout)) && callout.settings.contribution.enabled;
  const contributionsSlot = hasContributionType ? (
    <ContributionsSlot callout={callout} open={open} onContributionClick={handleContributionClick} />
  ) : undefined;

  const whiteboardOverlay = whiteboardContributionId ? (
    <WhiteboardContributionConnector
      open={true}
      calloutId={callout.id}
      contributionId={whiteboardContributionId}
      onClose={() => setWhiteboardContributionId(undefined)}
    />
  ) : null;

  const memoOverlay =
    memoContributionId && memoId ? (
      <MemoContributionConnector
        open={true}
        contributionId={memoContributionId}
        memoId={memoId}
        onClose={() => {
          setMemoContributionId(undefined);
          setMemoId(undefined);
        }}
      />
    ) : null;

  const framingMemoOverlay =
    framingMemoOpen && framingMemoId ? (
      <CrdMemoDialog
        open={true}
        memoId={framingMemoId}
        isContribution={false}
        onClose={() => handleFramingMemoClose()}
      />
    ) : null;

  const handleShareClick = () => setShareOpen(true);
  const settingsSlot = (
    <CalloutSettingsConnector callout={callout} moveActions={moveActions} onShare={handleShareClick} />
  );

  const shareDialog = <CalloutShareDialog open={shareOpen} onOpenChange={setShareOpen} callout={callout} />;

  if (!callout.comments?.id) {
    return (
      <>
        <CalloutDetailDialog
          open={open}
          onOpenChange={onOpenChange}
          callout={mapCalloutDetailsToDialogData(callout, t)}
          commentsSlot={<p className="text-body text-muted-foreground">{t('comments.empty')}</p>}
          pollSlot={pollSlot}
          whiteboardFramingSlot={whiteboardFramingSlot}
          memoFramingSlot={memoFramingSlot}
          mediaGalleryFramingSlot={mediaGalleryFramingSlot}
          callToActionFramingSlot={callToActionFramingSlot}
          hasContributions={hasContributionType}
          contributionsSlot={contributionsSlot}
          contributionsCount={callout.contributions.length}
          settingsSlot={settingsSlot}
          onShareClick={handleShareClick}
        />
        {whiteboardOverlay}
        {memoOverlay}
        {framingMemoOverlay}
        {shareDialog}
      </>
    );
  }

  return (
    <>
      <CalloutCommentsConnector roomId={callout.comments.id} calloutId={callout.id} roomData={callout.comments}>
        {({ thread, commentInput, commentCount }) => (
          <CalloutDetailDialog
            open={open}
            onOpenChange={onOpenChange}
            callout={{
              ...mapCalloutDetailsToDialogData(callout, t),
              commentCount,
            }}
            commentsSlot={thread}
            commentInputSlot={commentInput}
            hasContributions={hasContributionType}
            contributionsSlot={contributionsSlot}
            contributionsCount={callout.contributions.length}
            pollSlot={pollSlot}
            whiteboardFramingSlot={whiteboardFramingSlot}
            memoFramingSlot={memoFramingSlot}
            mediaGalleryFramingSlot={mediaGalleryFramingSlot}
            callToActionFramingSlot={callToActionFramingSlot}
            settingsSlot={settingsSlot}
            onShareClick={handleShareClick}
          />
        )}
      </CalloutCommentsConnector>
      {whiteboardOverlay}
      {memoOverlay}
      {framingMemoOverlay}
      {shareDialog}
    </>
  );
}
