import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutContributionType,
  CalloutFramingType,
} from '@/core/apollo/generated/graphql-schema';
import { isTaskBoardEnabled } from '@/crd/components/callout/task-board/taskBoard';
import { PostCard } from '@/crd/components/space/PostCard';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { canRenameCollaboraDocument } from '@/domain/collaboration/calloutContributions/collaboraDocument/canRenameCollaboraDocument';
import useCalloutInView from '@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView';
import buildGuestShareUrl from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';
import { useRememberedCalloutHeight } from '@/main/crdPages/space/hooks/useRememberedCalloutHeight';
import CrdWhiteboardView from '@/main/crdPages/whiteboard/CrdWhiteboardView';
import { useSpaceFullWidthState } from '@/main/ui/layout/LayoutWidthContext';
import {
  getCalloutContributionType,
  mapCalloutDetailsToPostCard,
  mapContributionTypeToPreviewKind,
  mapFramingTypeToPostType,
} from '../dataMappers/calloutDataMapper';
import { useCrdCalloutMoveActions } from '../hooks/useCrdCalloutMoveActions';
import { useFlowStateLayout } from '../hooks/useFlowStateLayout';
import { useMediaGalleryDirectUpload } from '../hooks/useMediaGalleryDirectUpload';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { CalloutPollConnector } from './CalloutPollConnector';
import { CalloutReactionsConnector } from './CalloutReactionsConnector';
import { CalloutSettingsConnector } from './CalloutSettingsConnector';
import { CalloutShareDialog } from './CalloutShareDialog';
import { CollaboraFramingEditorOverlay } from './CollaboraFramingEditorOverlay';
import { ContributionsPreviewConnector } from './ContributionsPreviewConnector';
import { ContributorCollectionConnector } from './ContributorCollectionConnector';
import { toCollaboraPreviewType } from './collaboraDocumentTypeMap';
import { SpaceCollectionConnector } from './SpaceCollectionConnector';
import { TaskBoardConnector } from './TaskBoardConnector';
import { TaskBoardDialog } from './TaskBoardDialog';

type LazyCalloutItemProps = {
  calloutId: string;
  calloutsSetId: string | undefined;
  /** Ordered list of all callout ids in the feed — drives move actions (plan T063/T066). */
  orderedCalloutIds?: string[];
  /** Set-level Update privilege — gates the move/reorder menu items (FR-101). */
  canReorder?: boolean;
  /**
   * Force the description to start collapsed ("Read more"), ignoring the
   * space-level display-mode setting. Used by scoped search so matches render
   * compact regardless of how the tab is configured to browse.
   */
  forceDescriptionCollapsed?: boolean;
  /**
   * Skeleton shape hints, known from the feed list before this card's details
   * query resolves — the placeholder reserves the framing preview + contributions
   * grid footprint so the feed doesn't jump when the card lands (issue #10043).
   */
  framingType?: CalloutFramingType;
  contributionType?: CalloutContributionType;
  contributionCount?: number;
  onClick?: () => void;
  onExpandClick?: () => void;
};

export function LazyCalloutItem({
  calloutId,
  calloutsSetId,
  orderedCalloutIds = [],
  canReorder = false,
  forceDescriptionCollapsed = false,
  framingType,
  contributionType,
  contributionCount,
  onClick,
  onExpandClick,
}: LazyCalloutItemProps) {
  // `withClassification: true` is required — the per-phase layout resolution reads
  // `callout.classification.flowState.tags[0]` (the phase display name) to look up the
  // state's descriptionDisplayMode / showPublishDetails. Without it the classification
  // is omitted, `flowStateTagValue` is undefined, and every callout silently falls back
  // to the layout DEFAULTS (expanded, publish details shown) regardless of admin settings.
  const { ref, inView, callout, loading } = useCalloutInView({
    calloutId,
    calloutsSetId,
    withClassification: true,
  });

  // Once loaded, the card's rendered height is remembered (per viewport width and per
  // rendering variant) so the next visit's placeholder takes exactly that height —
  // measured, not estimated. Recording pauses while the card is in a state the next
  // mount won't reproduce (inline comments open, description toggled by the viewer).
  const { wide } = useSpaceFullWidthState();
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [descriptionToggled, setDescriptionToggled] = useState(false);
  const { ref: contentRef, height } = useRememberedCalloutHeight({
    calloutId,
    variant: `${wide ? 'wide' : 'default'}:${forceDescriptionCollapsed ? 'compact' : 'feed'}`,
    paused: commentsExpanded || descriptionToggled,
  });

  const skeleton = (
    <PostCardSkeleton
      type={framingType ? mapFramingTypeToPostType(framingType) : undefined}
      contributions={
        contributionType
          ? { kind: mapContributionTypeToPreviewKind(contributionType), count: contributionCount ?? 0 }
          : undefined
      }
      height={height}
    />
  );

  return (
    <div ref={ref} id={calloutId}>
      {inView && !loading && callout ? (
        /* Own Suspense boundary: the card subtree pulls in lazily-loaded i18n namespaces
           (crd-reactions, crd-taskBoard) and chunks. Without a boundary here the first
           card to mount suspends up to the tab-level boundary, which swaps the ENTIRE
           feed for a spinner for a frame — the biggest single layout jump on the page
           (issue #10043). The fallback is the same skeleton, so nothing moves. The
           measured wrapper sits INSIDE the boundary so the fallback is never recorded. */
        <Suspense fallback={skeleton}>
          <div ref={contentRef}>
            <LazyCalloutItemContent
              callout={callout}
              calloutsSetId={calloutsSetId}
              orderedCalloutIds={orderedCalloutIds}
              canReorder={canReorder}
              forceDescriptionCollapsed={forceDescriptionCollapsed}
              commentsExpanded={commentsExpanded}
              onCommentsExpandedChange={setCommentsExpanded}
              onDescriptionToggle={() => setDescriptionToggled(true)}
              onClick={onClick}
              onExpandClick={onExpandClick}
            />
          </div>
        </Suspense>
      ) : (
        skeleton
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
  canReorder,
  forceDescriptionCollapsed,
  commentsExpanded,
  onCommentsExpandedChange,
  onDescriptionToggle,
  onClick,
  onExpandClick,
}: {
  callout: CalloutDetailsModelExtended;
  calloutsSetId: string | undefined;
  orderedCalloutIds: string[];
  canReorder: boolean;
  forceDescriptionCollapsed: boolean;
  /** Inline comments state is owned by the parent — it pauses height recording while open. */
  commentsExpanded: boolean;
  onCommentsExpandedChange: (expanded: boolean) => void;
  onDescriptionToggle: () => void;
  onClick?: () => void;
  onExpandClick?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  // A Tasks board opens to the board dialog (like a whiteboard/memo), not the
  // post-detail dialog. `isBoard` is confirmed asynchronously by the board
  // connector's query; until then a click falls back to the normal dialog.
  const [isBoard, setIsBoard] = useState(false);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [initialContributionId, setInitialContributionId] = useState<string | undefined>();
  const [initialMemoId, setInitialMemoId] = useState<string | undefined>();
  const [initialPostId, setInitialPostId] = useState<string | undefined>();
  const [collaboraEditorOpen, setCollaboraEditorOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // Framing-direct-open state: clicking "Open Memo" / "Open Whiteboard" in the
  // feed launches the matching editor without going through the callout dialog.
  const [framingMemoOpen, setFramingMemoOpen] = useState(false);
  const [framingWhiteboardOpen, setFramingWhiteboardOpen] = useState(false);
  const [fetchFramingMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });
  const framingRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation('crd-space');
  // Resolve per-phase layout from the FLOW_STATE classification tag.
  // `flowState.tags[0]` is the phase display name the callout is tagged under.
  // `useFlowStateLayout` reads from the cached SpaceTabsQuery (zero extra round-trips)
  // and falls back to defaults (Expanded, publish details shown) on any miss.
  const flowStateTagValue = callout.classification?.flowState?.tags[0];
  const { descriptionCollapsed, showPublishDetails } = useFlowStateLayout(flowStateTagValue);

  const postData = {
    ...mapCalloutDetailsToPostCard(callout, t),
    // Scoped search forces compact ("Read more") AND ignores the per-phase settings entirely
    // (FR-016: per-phase layout does not override the forced-compact surface) — so publish
    // details fall back to the default (shown), not the phase's showPublishDetails value.
    descriptionExpanded: forceDescriptionCollapsed ? false : !descriptionCollapsed,
    showPublishDetails: forceDescriptionCollapsed ? true : showPublishDetails,
  };

  // The hook must run unconditionally (rules of hooks), but the move menu items
  // are only offered when the user has Update on the calloutsSet. Passing
  // `undefined` makes `deriveCalloutMenuVisibility`'s `canMoveSet` false, so
  // non-privileged users (incl. non-members) never see reorder controls.
  const moveActionsRaw = useCrdCalloutMoveActions({
    calloutsSetId,
    orderedCalloutIds,
    calloutId: callout.id,
  });
  const moveActions = canReorder ? moveActionsRaw : undefined;

  // The second arg is the underlying entity id — memo id for memo contributions,
  // post id for post contributions. The detail-dialog connector splits them by
  // `contributionType` and uses each for the relevant overlay (memo edit,
  // post edit pencil → CrdPostContributionDialog, etc.). Without `postId`
  // plumbed through, the post-edit overlay would be gated on `postId &&
  // postContributionId` and silently no-op.
  const openDialog = (contributionId?: string, entityId?: string) => {
    setInitialContributionId(contributionId);
    const contributionType = getCalloutContributionType(callout);
    if (contributionType === CalloutContributionType.Post) {
      setInitialPostId(entityId);
      setInitialMemoId(undefined);
    } else {
      setInitialMemoId(entityId);
      setInitialPostId(undefined);
    }
    setDialogOpen(true);
  };

  // A Tasks board callout opens to the board dialog; any other callout opens its
  // detail dialog. Detection is async, so this falls back to the dialog until
  // the board connector confirms.
  const handleCardOpen = () => {
    if (isBoard) {
      setBoardDialogOpen(true);
    } else {
      openDialog();
    }
  };

  // The callout-header fullscreen icon opens the board dialog AND enters browser
  // fullscreen. requestFullscreen must run inside the click gesture, so it is
  // fired here (not in an effect after the dialog mounts).
  const openBoardFullscreen = () => {
    const request = document.documentElement.requestFullscreen?.();
    if (request) request.catch(() => {});
    setBoardDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInitialContributionId(undefined);
      setInitialMemoId(undefined);
      setInitialPostId(undefined);
    }
  };

  // Mirror CalloutDetailDialogConnector.handleFramingMemoClose: refresh the
  // framing memo's markdown after the collab room has had a chance to persist
  // its snapshot (~2.5s), so the feed preview reflects the latest content.
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

  // Gate the feed-level preview on the presence of `allowedTypes`, not on the
  // `enabled` flag. Turning both Members/Admins switches off sets
  // `enabled: false`, but the callout is still "a memo callout that collects
  // memos" — the `Contributions (n)` header and any existing contributions
  // must stay visible. The Add tile inside the preview is gated separately on
  // `canCreateContribution`.
  const hasContributionType = callout.settings.contribution.allowedTypes.length > 0;
  const collaboraDocumentId = callout.framing.collaboraDocument?.id;
  // Editor-header pencil: content editors (UPDATE_CONTENT) may rename too, not just UPDATE holders.
  const canRenameFramingDocument = canRenameCollaboraDocument({
    documentPrivileges: callout.framing.collaboraDocument?.authorization?.myPrivileges,
    calloutPrivileges: callout.authorization?.myPrivileges,
    includeContentEditors: true,
  });

  // Omit the bar entirely when the callout has no reactions summary (the server
  // module may not be deployed). The connector renders null in that case, but an
  // element is still truthy — passing it would render an empty padded section.
  const reactionsBar =
    callout.reactionsSummary == null ? undefined : (
      <CalloutReactionsConnector
        calloutId={callout.id}
        reactionsSummary={callout.reactionsSummary}
        myPrivileges={callout.authorization?.myPrivileges?.map(p => p as string)}
        isPublished={!callout.draft}
      />
    );

  // POSTS-only callouts may be Tasks boards. Gate the (extra) board query on the
  // cheap, already-loaded signals — POSTS-only contribution config and the build
  // kill switch — so non-board callouts never fetch it. The connector confirms
  // the board marker from its own query and falls back to the plain preview when
  // absent, keeping every non-board callout byte-identical.
  const allowedContributionTypes = callout.settings.contribution.allowedTypes;
  const isPostsOnly =
    allowedContributionTypes.length === 1 && allowedContributionTypes[0] === CalloutContributionType.Post;
  const maybeTaskBoard = isPostsOnly && isTaskBoardEnabled();

  const plainContributionsPreview = hasContributionType ? (
    <ContributionsPreviewConnector
      callout={callout}
      onShowAll={() => openDialog()}
      onContributionClick={(contributionId, memoId) => openDialog(contributionId, memoId)}
      isTaskBoard={isBoard}
    />
  ) : undefined;

  const contributionsPreview = maybeTaskBoard ? (
    <TaskBoardConnector
      calloutId={callout.id}
      onBoardResolved={setIsBoard}
      fallback={plainContributionsPreview}
      onOpenTask={contributionId => {
        // Clicking a task in the inline preview presents it on top of the board
        // dialog: open the board dialog and the task's focused dialog above it.
        setBoardDialogOpen(true);
        openDialog(contributionId);
      }}
    />
  ) : (
    plainContributionsPreview
  );

  const pollPreview =
    callout.framing.type === CalloutFramingType.Poll ? <CalloutPollConnector callout={callout} /> : null;

  // Contributor-collection callout body (feature 008): renders the self-updating
  // contributor cards/map for the active type. The callout accepts no
  // contributions, so it has no contributions-preview — only this body. The
  // negative margin pulls the body against the Card root's `gap-6` so the
  // filters sit close under the callout title.
  const contributorsPreview =
    callout.framing.type === CalloutFramingType.Contributors ? (
      <ContributorCollectionConnector calloutId={callout.id} className="-mt-4" />
    ) : null;

  // Spaces-collection callout body (feature 013): renders the host space's
  // subspaces as cards (name search + filters + empty state via the reused
  // SpaceSubspacesList). Like the contributors body, it accepts no contributions,
  // so it has no contributions-preview — only this body.
  const spacesPreview =
    callout.framing.type === CalloutFramingType.Spaces ? (
      <SpaceCollectionConnector calloutId={callout.id} className="mt-2" />
    ) : null;

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
                handleCardOpen();
                onClick?.();
              }}
              onOpenFraming={handleOpenFraming}
              onAddMediaGalleryImages={handleAddMediaGalleryImages}
              settingsSlot={
                <CalloutSettingsConnector
                  callout={callout}
                  moveActions={moveActions}
                  onShare={() => setShareOpen(true)}
                  isTaskBoard={isBoard}
                />
              }
              onExpandClick={isBoard ? openBoardFullscreen : onExpandClick}
              expandIcon={isBoard ? 'fullscreen' : undefined}
              onOpenFramingDocument={collaboraDocumentId ? () => setCollaboraEditorOpen(true) : undefined}
              commentsSlot={thread}
              commentInputSlot={commentsEnabled ? commentInput : null}
              onCommentsExpandedChange={onCommentsExpandedChange}
              onDescriptionToggle={onDescriptionToggle}
              contributionsPreview={contributionsPreview}
              reactionsSlot={reactionsBar}
            >
              {pollPreview}
              {contributorsPreview}
              {spacesPreview}
            </PostCard>
          )}
        </CalloutCommentsConnector>
      ) : (
        <PostCard
          post={postData}
          onClick={() => {
            handleCardOpen();
            onClick?.();
          }}
          onOpenFraming={handleOpenFraming}
          onAddMediaGalleryImages={handleAddMediaGalleryImages}
          onCommentsClick={() => openDialog()}
          onDescriptionToggle={onDescriptionToggle}
          settingsSlot={
            <CalloutSettingsConnector
              callout={callout}
              moveActions={moveActions}
              onShare={() => setShareOpen(true)}
              isTaskBoard={isBoard}
            />
          }
          onExpandClick={isBoard ? openBoardFullscreen : onExpandClick}
          expandIcon={isBoard ? 'fullscreen' : undefined}
          onOpenFramingDocument={collaboraDocumentId ? () => setCollaboraEditorOpen(true) : undefined}
          contributionsPreview={contributionsPreview}
          reactionsSlot={reactionsBar}
        >
          {pollPreview}
          {contributorsPreview}
          {spacesPreview}
        </PostCard>
      )}
      {mediaGalleryFileInput}

      {isBoard && boardDialogOpen && (
        <TaskBoardDialog
          calloutId={callout.id}
          title={callout.framing.profile.displayName}
          open={boardDialogOpen}
          onOpenChange={setBoardDialogOpen}
          onOpenTask={openDialog}
        />
      )}

      <CalloutDetailDialogConnector
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        callout={callout}
        moveActions={moveActions}
        initialContributionId={initialContributionId}
        initialMemoId={initialMemoId}
        initialPostId={initialPostId}
        // A task's focused dialog opens on top of the board dialog, so it (and
        // its edit/delete/share) must stack above it.
        elevated={isBoard}
      />

      {collaboraDocumentId && (
        <CollaboraFramingEditorOverlay
          open={collaboraEditorOpen}
          collaboraDocumentId={collaboraDocumentId}
          title={callout.framing.collaboraDocument?.profile?.displayName ?? callout.framing.profile.displayName}
          documentType={toCollaboraPreviewType(callout.framing.collaboraDocument?.documentType)}
          canRename={canRenameFramingDocument}
          onClose={() => setCollaboraEditorOpen(false)}
        />
      )}
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
