import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { PostCard } from '@/crd/components/space/PostCard';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutInView from '@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';
import { mapCalloutDetailsToPostCard } from '../dataMappers/calloutDataMapper';
import { useCrdCalloutMoveActions } from '../hooks/useCrdCalloutMoveActions';
import { useMediaGalleryDirectUpload } from '../hooks/useMediaGalleryDirectUpload';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { CalloutPollConnector } from './CalloutPollConnector';
import { CalloutSettingsConnector } from './CalloutSettingsConnector';
import { CalloutShareDialog } from './CalloutShareDialog';
import { ContributionsPreviewConnector } from './ContributionsPreviewConnector';

type LazyCalloutItemProps = {
  calloutId: string;
  calloutsSetId: string | undefined;
  /** Ordered list of all callout ids in the feed — drives move actions (plan T063/T066). */
  orderedCalloutIds?: string[];
  onClick?: () => void;
  onExpandClick?: () => void;
};

export function LazyCalloutItem({
  calloutId,
  calloutsSetId,
  orderedCalloutIds = [],
  onClick,
  onExpandClick,
}: LazyCalloutItemProps) {
  const { ref, inView, callout, loading } = useCalloutInView({
    calloutId,
    calloutsSetId,
  });

  return (
    <div ref={ref} id={calloutId}>
      {inView && !loading && callout ? (
        <LazyCalloutItemContent
          callout={callout}
          calloutsSetId={calloutsSetId}
          orderedCalloutIds={orderedCalloutIds}
          onClick={onClick}
          onExpandClick={onExpandClick}
        />
      ) : (
        <PostCardSkeleton />
      )}
    </div>
  );
}

/**
 * Inner component rendered once the callout is loaded.
 * Separated so hooks can be called unconditionally.
 */
function LazyCalloutItemContent({
  callout,
  calloutsSetId,
  orderedCalloutIds,
  onClick,
  onExpandClick,
}: {
  callout: CalloutDetailsModelExtended;
  calloutsSetId: string | undefined;
  orderedCalloutIds: string[];
  onClick?: () => void;
  onExpandClick?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialContributionId, setInitialContributionId] = useState<string | undefined>();
  const [initialMemoId, setInitialMemoId] = useState<string | undefined>();
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // Framing-direct-open state: clicking "Open Memo" / "Open Whiteboard" in the
  // feed launches the matching editor without going through the callout dialog.
  const [framingMemoOpen, setFramingMemoOpen] = useState(false);
  const [framingWhiteboardOpen, setFramingWhiteboardOpen] = useState(false);
  const [fetchFramingMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });
  const framingRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation('crd-space');

  const postData = mapCalloutDetailsToPostCard(callout, t);

  const moveActions = useCrdCalloutMoveActions({
    calloutsSetId,
    orderedCalloutIds,
    calloutId: callout.id,
  });

  const openDialog = (contributionId?: string, memoId?: string) => {
    setInitialContributionId(contributionId);
    setInitialMemoId(memoId);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInitialContributionId(undefined);
      setInitialMemoId(undefined);
    }
  };

  // Mirror CalloutDetailDialogConnector.handleFramingMemoClose: refresh the
  // framing memo's markdown after Hocuspocus has had a chance to persist
  // (~2.5s), so the feed preview reflects the latest content.
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

  useEffect(() => {
    return () => {
      if (framingRefreshRef.current) {
        clearTimeout(framingRefreshRef.current);
        framingRefreshRef.current = null;
      }
    };
  }, []);

  const framingMemoId = callout.framing.memo?.id;
  const framingWhiteboard = callout.framing.whiteboard;
  const handleOpenFraming =
    callout.framing.type === CalloutFramingType.Memo && framingMemoId
      ? () => setFramingMemoOpen(true)
      : callout.framing.type === CalloutFramingType.Whiteboard && framingWhiteboard
        ? () => setFramingWhiteboardOpen(true)
        : undefined;

  // Direct media-gallery upload from the feed PostCard (MUI parity, no edit-dialog
  // round-trip). Only enabled when the user has Update on the callout AND it has
  // a media-gallery framing.
  const canEditMediaGallery = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const isMediaGalleryFraming = callout.framing.type === CalloutFramingType.MediaGallery;
  const { triggerAddImages: handleAddMediaGalleryImages, fileInputElement: mediaGalleryFileInput } =
    useMediaGalleryDirectUpload({
      mediaGalleryId: callout.framing.mediaGallery?.id,
      existingVisuals: callout.framing.mediaGallery?.visuals ?? [],
      enabled: canEditMediaGallery && isMediaGalleryFraming,
    });

  const contributionsEnabled = callout.settings.contribution.enabled;

  const contributionsPreview = contributionsEnabled ? (
    <ContributionsPreviewConnector
      callout={callout}
      onShowAll={() => openDialog()}
      onContributionClick={(contributionId, memoId) => openDialog(contributionId, memoId)}
    />
  ) : undefined;

  const pollPreview =
    callout.framing.type === CalloutFramingType.Poll ? <CalloutPollConnector callout={callout} /> : null;

  // Without a comments room we can't wire the inline thread — fall back to the
  // dialog-only flow. The dialog itself handles its own "no room" rendering.
  const commentsRoomId = callout.comments?.id;
  const hasCommentsRoom = Boolean(commentsRoomId) && callout.comments !== undefined;
  // Mirrors MUI: when the admin disables commenting, suppress the comment input but keep
  // existing messages visible (read-only). PostCard hides the footer entirely when
  // commentsEnabled === false AND no messages exist.
  const commentsEnabled = callout.settings.framing.commentsEnabled;

  return (
    <>
      {hasCommentsRoom && commentsRoomId ? (
        <CalloutCommentsConnector
          roomId={commentsRoomId}
          calloutId={callout.id}
          roomData={callout.comments}
          skipSubscription={!commentsExpanded}
        >
          {({ thread, commentInput }) => (
            <PostCard
              post={postData}
              onClick={() => {
                openDialog();
                onClick?.();
              }}
              onOpenFraming={handleOpenFraming}
              onAddMediaGalleryImages={handleAddMediaGalleryImages}
              settingsSlot={
                <CalloutSettingsConnector
                  callout={callout}
                  moveActions={moveActions}
                  onShare={() => setShareOpen(true)}
                />
              }
              onExpandClick={onExpandClick}
              commentsSlot={thread}
              commentInputSlot={commentsEnabled ? commentInput : null}
              onCommentsExpandedChange={setCommentsExpanded}
              contributionsPreview={contributionsPreview}
            >
              {pollPreview}
            </PostCard>
          )}
        </CalloutCommentsConnector>
      ) : (
        <PostCard
          post={postData}
          onClick={() => {
            openDialog();
            onClick?.();
          }}
          onOpenFraming={handleOpenFraming}
          onAddMediaGalleryImages={handleAddMediaGalleryImages}
          onCommentsClick={() => openDialog()}
          settingsSlot={
            <CalloutSettingsConnector callout={callout} moveActions={moveActions} onShare={() => setShareOpen(true)} />
          }
          onExpandClick={onExpandClick}
          contributionsPreview={contributionsPreview}
        >
          {pollPreview}
        </PostCard>
      )}
      {mediaGalleryFileInput}

      <CalloutDetailDialogConnector
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        callout={callout}
        moveActions={moveActions}
        initialContributionId={initialContributionId}
        initialMemoId={initialMemoId}
      />

      {framingMemoOpen && framingMemoId && (
        <CrdMemoDialog open={true} memoId={framingMemoId} isContribution={false} onClose={handleFramingMemoClose} />
      )}

      {framingWhiteboardOpen && framingWhiteboard && (
        <CrdWhiteboardView
          whiteboardId={framingWhiteboard.id}
          whiteboard={framingWhiteboard}
          authorization={framingWhiteboard.authorization}
          whiteboardShareUrl={callout.framing.profile.url}
          guestShareUrl={buildGuestShareUrl(framingWhiteboard.id ?? framingWhiteboard.nameID ?? undefined)}
          readOnlyDisplayName={true}
          displayName={callout.framing.profile.displayName}
          preventWhiteboardDeletion={true}
          loadingWhiteboards={false}
          backToWhiteboards={() => setFramingWhiteboardOpen(false)}
        />
      )}

      <CalloutShareDialog open={shareOpen} onOpenChange={setShareOpen} callout={callout} />
    </>
  );
}
