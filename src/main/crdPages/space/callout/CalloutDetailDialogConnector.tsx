import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutContributionQuery, useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutContributionType,
  CalloutFramingType,
} from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import { CalloutPostPreview } from '@/crd/components/callout/CalloutPostPreview';
import { CalloutWhiteboardContributionPreview } from '@/crd/components/callout/CalloutWhiteboardContributionPreview';
import { ShareButton } from '@/crd/components/common/ShareButton';
import { ContributionLinkList } from '@/crd/components/contribution/ContributionLinkList';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatRelativeFromNow } from '@/crd/lib/dateTimeFormat';
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
import { CollaboraFramingConnector } from './CollaboraFramingConnector';
import { CollaboraFramingEditorOverlay } from './CollaboraFramingEditorOverlay';
import { ContributionGridConnector } from './ContributionGridConnector';
import { toCollaboraPreviewType } from './collaboraDocumentTypeMap';
import { LinkContributionAddConnector } from './LinkContributionAddConnector';
import { LinkContributionEditConnector } from './LinkContributionEditConnector';
import { MediaGalleryFramingConnector } from './MediaGalleryFramingConnector';
import { MemoContributionAddConnector } from './MemoContributionAddConnector';
import { MemoContributionConnector } from './MemoContributionConnector';
import { MemoFramingConnector } from './MemoFramingConnector';
import { PostContributionAddConnector } from './PostContributionAddConnector';
import { PostContributionConnector } from './PostContributionConnector';
import { WhiteboardContributionAddConnector } from './WhiteboardContributionAddConnector';
import { WhiteboardContributionConnector } from './WhiteboardContributionConnector';
import { WhiteboardFramingConnector } from './WhiteboardFramingConnector';

type CalloutDetailDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailsModelExtended;
  /** If set, the matching contribution dialog opens immediately on top of the callout dialog.
   *  Routed to whiteboard / memo / post overlay based on `callout.settings.contribution.type`. */
  initialContributionId?: string;
  /** For memo contributions only: the underlying memo id (the contribution wrapper id goes into `initialContributionId`). */
  initialMemoId?: string;
  /** For post contributions only: the underlying post id (the contribution wrapper id goes into `initialContributionId`). */
  initialPostId?: string;
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
  onContributionClick?: (id: string, entityId?: string) => void;
  onContributionCreated?: () => void;
}) {
  const { i18n } = useTranslation('crd-space');
  const locale = resolveDateFnsLocale(i18n.language);
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
    skip: !open || !contributionType,
  });

  // Visibility follows MUI: presence of `allowedTypes` (i.e. `contributionType`)
  // is what marks the callout as collecting contributions. `enabled: false`
  // (turning both Members/Admins switches off) is a soft-disable — existing
  // contributions stay visible and the section header is still there; only the
  // Add tile is suppressed via `canCreateContribution`.
  if (!contributionType) {
    return null;
  }

  const mapped = items
    .map(item => mapAnyContributionToCardData(item, locale))
    .filter(Boolean) as ContributionCardData[];

  const defaults = callout.contributionDefaults;
  const trailingSlot = canCreateContribution ? (
    contributionType === CalloutContributionType.Whiteboard ? (
      <WhiteboardContributionAddConnector
        calloutId={callout.id}
        defaultDisplayName={defaults?.defaultDisplayName}
        defaultContent={defaults?.whiteboardContent}
        onCreated={onContributionCreated}
      />
    ) : contributionType === CalloutContributionType.Memo ? (
      <MemoContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />
    ) : contributionType === CalloutContributionType.Post ? (
      <PostContributionAddConnector
        calloutId={callout.id}
        defaultDisplayName={defaults?.defaultDisplayName}
        defaultDescription={defaults?.postDescription}
        onCreated={onContributionCreated}
      />
    ) : null
  ) : null;

  // Link contributions render as a list (not a card grid), with inline add + edit / delete
  // affordances gated by per-link authorization.
  if (contributionType === CalloutContributionType.Link) {
    return (
      <div ref={inViewRef}>
        {!loading && (
          <LinkContributionListSlot
            calloutId={callout.id}
            contributions={mapped}
            canCreateContribution={canCreateContribution}
            onContributionCreated={onContributionCreated}
          />
        )}
      </div>
    );
  }

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

function LinkContributionListSlot({
  calloutId,
  contributions,
  canCreateContribution,
  onContributionCreated,
}: {
  calloutId: string;
  contributions: ContributionCardData[];
  canCreateContribution: boolean;
  onContributionCreated?: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<
    | {
        contributionId: string;
        linkId: string;
        url: string;
        displayName: string;
        description?: string;
        canDelete: boolean;
        intent: 'edit' | 'delete';
      }
    | undefined
  >(undefined);

  const links = contributions.map(c => ({
    id: c.id,
    url: c.linkUrl ?? '',
    displayName: c.title,
    description: c.linkDescription,
    canEdit: c.canEditLink,
    canDelete: c.canDeleteLink,
  }));

  const openTarget = (contributionId: string, intent: 'edit' | 'delete') => {
    const c = contributions.find(item => item.id === contributionId);
    if (!c || !c.linkId) return;
    setEditTarget({
      contributionId: c.id,
      linkId: c.linkId,
      url: c.linkUrl ?? '',
      displayName: c.title,
      description: c.linkDescription,
      canDelete: Boolean(c.canDeleteLink),
      intent,
    });
  };

  return (
    <>
      <ContributionLinkList
        links={links}
        canAdd={canCreateContribution}
        onAdd={() => setAddOpen(true)}
        onEdit={id => openTarget(id, 'edit')}
        onDelete={id => openTarget(id, 'delete')}
      />
      {canCreateContribution && (
        <LinkContributionAddConnector
          calloutId={calloutId}
          inlineTrigger={true}
          open={addOpen}
          onOpenChange={setAddOpen}
          onCreated={onContributionCreated}
        />
      )}
      <LinkContributionEditConnector
        calloutId={calloutId}
        target={editTarget}
        canDelete={editTarget?.canDelete}
        onClose={() => setEditTarget(undefined)}
      />
    </>
  );
}

export function CalloutDetailDialogConnector({
  open,
  onOpenChange,
  callout,
  initialContributionId,
  initialMemoId,
  initialPostId,
  moveActions,
}: CalloutDetailDialogConnectorProps) {
  const { t, i18n } = useTranslation('crd-space');
  const contributionType = getCalloutContributionType(callout);
  const initialIsMemo = contributionType === CalloutContributionType.Memo;
  const initialIsPost = contributionType === CalloutContributionType.Post;
  const initialIsWhiteboard = contributionType === CalloutContributionType.Whiteboard;

  const [whiteboardContributionId, setWhiteboardContributionId] = useState<string | undefined>(
    initialIsWhiteboard ? initialContributionId : undefined
  );
  const [memoContributionId, setMemoContributionId] = useState<string | undefined>(
    initialIsMemo ? initialContributionId : undefined
  );
  const [memoId, setMemoId] = useState<string | undefined>(initialMemoId);
  const [postContributionId, setPostContributionId] = useState<string | undefined>(
    initialIsPost ? initialContributionId : undefined
  );
  const [postId, setPostId] = useState<string | undefined>(initialPostId);
  // Whiteboard preview / editor flow (MUI parity): selecting a whiteboard
  // contribution swaps the grid for an inline preview thumbnail; the
  // collaborative editor only opens when the user clicks the preview.
  const [whiteboardEditorOpen, setWhiteboardEditorOpen] = useState(false);
  // Post-edit dialog opens on top of the inline preview when the user clicks the
  // edit pencil. Clicking a contribution card no longer opens the edit form
  // directly — it selects the post and the connector renders the read-only
  // preview inside the dialog body (MUI parity).
  const [postEditOpen, setPostEditOpen] = useState(false);
  const [framingMemoOpen, setFramingMemoOpen] = useState(false);
  const [framingCollaboraOpen, setFramingCollaboraOpen] = useState(false);
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
    } else if (contributionType === CalloutContributionType.Post) {
      setPostContributionId(initialContributionId);
      setPostId(initialPostId);
    } else if (contributionType === CalloutContributionType.Whiteboard) {
      // Deep-linked whiteboard contributions open the editor immediately —
      // MUI parity (`openContributionDialogOnLoad`). The inline preview slot
      // becomes visible after the user closes the editor.
      setWhiteboardContributionId(initialContributionId);
      setWhiteboardEditorOpen(true);
    }
    // Other contribution types (Link) don't have a dedicated overlay; the
    // grid card itself owns the navigation.
  }, [initialContributionId, initialMemoId, initialPostId, contributionType]);

  // Reset per-contribution state whenever the dialog closes so reopening
  // starts from the fresh initial values rather than stale selections from
  // the previous session.
  useEffect(() => {
    if (open) return;
    setWhiteboardContributionId(initialIsWhiteboard ? initialContributionId : undefined);
    setMemoContributionId(initialIsMemo ? initialContributionId : undefined);
    setMemoId(initialMemoId);
    setPostContributionId(initialIsPost ? initialContributionId : undefined);
    setPostId(initialPostId);
    setWhiteboardEditorOpen(false);
    setPostEditOpen(false);
  }, [open, initialContributionId, initialIsMemo, initialIsPost, initialIsWhiteboard, initialMemoId, initialPostId]);

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
  // MUI parity (CalloutFramingMediaGallery): when the user has Update on the callout
  // the connector owns the file picker + upload mutation directly — clicking
  // "Add images" goes straight to the OS file picker, not through the edit dialog.
  const canEditMediaGallery = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const mediaGalleryFramingSlot = hasMediaGalleryFraming ? (
    <MediaGalleryFramingConnector callout={callout} canEdit={canEditMediaGallery} />
  ) : undefined;

  const hasCollaboraFraming =
    callout.framing.type === CalloutFramingType.CollaboraDocument && !!callout.framing.collaboraDocument;
  const collaboraFramingSlot = hasCollaboraFraming ? (
    <CollaboraFramingConnector callout={callout} onOpen={() => setFramingCollaboraOpen(true)} />
  ) : undefined;
  const framingCollaboraDocument = callout.framing.collaboraDocument;
  const framingCollaboraTitle = framingCollaboraDocument?.profile?.displayName ?? callout.framing.profile.displayName;

  const hasCallToAction = callout.framing.type === CalloutFramingType.Link && !!callout.framing.link;
  const callToActionFramingSlot = hasCallToAction ? <CallToActionFramingConnector callout={callout} /> : undefined;

  const handleContributionClick = (contributionId: string, clickedEntityId?: string) => {
    if (contributionType === CalloutContributionType.Memo) {
      setMemoContributionId(contributionId);
      setMemoId(clickedEntityId);
    } else if (contributionType === CalloutContributionType.Post) {
      setPostContributionId(contributionId);
      setPostId(clickedEntityId);
    } else if (contributionType === CalloutContributionType.Whiteboard) {
      // MUI parity (`CalloutContributionPreview` with `openContributionDialogOnLoad`):
      // clicking a whiteboard card jumps the user straight into the collaborative
      // editor. The inline preview then becomes visible underneath when the user
      // closes the editor (since `whiteboardContributionId` stays set).
      setWhiteboardContributionId(contributionId);
      setWhiteboardEditorOpen(true);
    }
  };

  // See `ContributionsSlot` above for why `enabled` is intentionally NOT in this gate.
  const hasContributionType = Boolean(getCalloutContributionType(callout));
  const contributionsSlot = hasContributionType ? (
    <ContributionsSlot callout={callout} open={open} onContributionClick={handleContributionClick} />
  ) : undefined;

  // Inline preview of the selected post contribution — mirrors the MUI flow
  // where clicking a post card swaps the contributions grid for a read-only
  // preview of the chosen post (`CalloutContributionPreview` + `CalloutContributionPreviewPost`).
  const { data: postContributionData, loading: loadingPostContribution } = useCalloutContributionQuery({
    variables: { contributionId: postContributionId ?? '', includePost: true },
    skip: !open || !postContributionId || contributionType !== CalloutContributionType.Post,
  });
  const selectedPost = postContributionData?.lookup.contribution?.post;
  const selectedPostUrl = selectedPost?.profile?.url;
  // Edit privileges live on the contribution wrapper, not the inner post — same
  // shape MUI uses in `useCalloutContributionQuery` to gate the edit button.
  const canEditSelectedPost =
    postContributionData?.lookup.contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ??
    false;

  // Whiteboard contribution data — drives the inline preview (header + thumbnail
  // + click-to-open overlay). MUI parity: clicking a whiteboard card surfaces
  // this preview first; the full collaborative editor only mounts when the user
  // clicks through. Fetching from `lookup.contribution` keeps the preview
  // independent from the costlier WhiteboardFromCallout query that the editor
  // uses internally.
  const { data: whiteboardContributionData, loading: loadingWhiteboardContribution } = useCalloutContributionQuery({
    variables: { contributionId: whiteboardContributionId ?? '', includeWhiteboard: true },
    skip: !open || !whiteboardContributionId || contributionType !== CalloutContributionType.Whiteboard,
  });
  const selectedWhiteboard = whiteboardContributionData?.lookup.contribution?.whiteboard;
  const canEditSelectedWhiteboard =
    whiteboardContributionData?.lookup.contribution?.authorization?.myPrivileges?.includes(
      AuthorizationPrivilege.Update
    ) ?? false;

  const selectedWhiteboardContributionSlot =
    whiteboardContributionId && contributionType === CalloutContributionType.Whiteboard ? (
      <CalloutWhiteboardContributionPreview
        loading={loadingWhiteboardContribution && !selectedWhiteboard}
        whiteboard={{
          id: selectedWhiteboard?.id ?? whiteboardContributionId,
          title: selectedWhiteboard?.profile.displayName ?? '',
          author: selectedWhiteboard?.createdBy?.profile
            ? {
                name: selectedWhiteboard.createdBy.profile.displayName,
                avatarUrl: selectedWhiteboard.createdBy.profile.avatar?.uri,
              }
            : undefined,
          timestamp: formatRelativeFromNow(
            selectedWhiteboard?.createdDate as string | number | Date | undefined,
            resolveDateFnsLocale(i18n.language)
          ),
          previewUrl: selectedWhiteboard?.profile.preview?.uri,
        }}
        onOpen={() => setWhiteboardEditorOpen(true)}
        onEdit={canEditSelectedWhiteboard ? () => setWhiteboardEditorOpen(true) : undefined}
        onClose={() => setWhiteboardContributionId(undefined)}
        shareSlot={
          selectedWhiteboard?.profile?.url ? (
            <ShareButton
              url={selectedWhiteboard.profile.url}
              tooltip={t('whiteboardPreview.share')}
              dialogTitle={t('whiteboardPreview.share')}
            />
          ) : undefined
        }
      />
    ) : undefined;

  const selectedPostContributionSlot =
    postContributionId && contributionType === CalloutContributionType.Post ? (
      <CalloutPostPreview
        loading={loadingPostContribution && !selectedPost}
        post={{
          id: selectedPost?.id ?? postContributionId,
          title: selectedPost?.profile.displayName ?? '',
          author: selectedPost?.createdBy?.profile
            ? {
                name: selectedPost.createdBy.profile.displayName,
                avatarUrl: selectedPost.createdBy.profile.avatar?.uri,
              }
            : undefined,
          // Match MUI's contribution-preview header ("1 hour ago" / "5 minutes ago")
          // — the precise date is shown on the contribution card itself; in the
          // inline preview we want the at-a-glance relative distance.
          timestamp: formatRelativeFromNow(
            selectedPost?.createdDate as string | number | Date | undefined,
            resolveDateFnsLocale(i18n.language)
          ),
          description: selectedPost?.profile.description ?? undefined,
          tags: selectedPost?.profile.tagset?.tags ?? [],
          references: selectedPost?.profile.references?.map(ref => ({
            id: ref.id,
            name: ref.name,
            uri: ref.uri,
            description: ref.description ?? undefined,
          })),
        }}
        onEdit={canEditSelectedPost ? () => setPostEditOpen(true) : undefined}
        onClose={() => {
          setPostContributionId(undefined);
          setPostId(undefined);
        }}
        shareSlot={
          selectedPostUrl ? (
            <ShareButton url={selectedPostUrl} tooltip={t('postPreview.share')} dialogTitle={t('postPreview.share')} />
          ) : undefined
        }
      />
    ) : undefined;

  // Single slot consumed by `CalloutDetailDialog` — either the post preview or
  // the whiteboard preview, never both (the contribution-type strip is uniform
  // per callout, so only one of these is set at a time).
  const selectedContributionSlot = selectedWhiteboardContributionSlot ?? selectedPostContributionSlot;

  const whiteboardOverlay =
    whiteboardEditorOpen && whiteboardContributionId ? (
      <WhiteboardContributionConnector
        open={true}
        calloutId={callout.id}
        contributionId={whiteboardContributionId}
        // Returning from the editor lands on the inline preview, not the grid —
        // matches the MUI nav pattern. The user closes the preview explicitly
        // (via its X button) to return to the grid.
        onClose={() => setWhiteboardEditorOpen(false)}
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

  // Fall back to the fetched post's id when the entry point (feed thumbnail
  // click, deep link) didn't plumb `postId` through. The contribution-query
  // resolution above already returns `selectedPost.id`, so the edit overlay
  // can open against it even if the `postId` URL/click state was empty —
  // matches the MUI `CalloutContributionPreviewPost` edit pencil, which
  // never depended on a route param for the post id.
  const resolvedPostId = postId ?? selectedPost?.id;
  const postOverlay =
    postEditOpen && postContributionId && resolvedPostId ? (
      <PostContributionConnector
        open={true}
        calloutId={callout.id}
        calloutsSetId={callout.calloutsSetId}
        contributionId={postContributionId}
        postId={resolvedPostId}
        // Closing the edit dialog returns to the read-only preview — only
        // explicit close on the preview itself clears the selection.
        onClose={() => setPostEditOpen(false)}
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

  const framingCollaboraOverlay = framingCollaboraDocument ? (
    <CollaboraFramingEditorOverlay
      open={framingCollaboraOpen}
      collaboraDocumentId={framingCollaboraDocument.id}
      title={framingCollaboraTitle}
      documentType={toCollaboraPreviewType(framingCollaboraDocument.documentType)}
      onClose={() => setFramingCollaboraOpen(false)}
    />
  ) : null;

  const handleShareClick = () => setShareOpen(true);
  const settingsSlot = (
    <CalloutSettingsConnector callout={callout} moveActions={moveActions} onShare={handleShareClick} />
  );

  const shareDialog = <CalloutShareDialog open={shareOpen} onOpenChange={setShareOpen} callout={callout} />;

  // Mirrors MUI: when the admin disables commenting, suppress the comment input but keep
  // existing messages readable. The dialog itself hides the discussion section entirely
  // when commentsEnabled is false AND there are no existing messages.
  const commentsEnabled = callout.settings.framing.commentsEnabled;

  if (!callout.comments?.id) {
    return (
      <>
        <CalloutDetailDialog
          open={open}
          onOpenChange={onOpenChange}
          callout={mapCalloutDetailsToDialogData(callout, t)}
          commentsSlot={<p className="text-body text-muted-foreground">{t('comments.empty')}</p>}
          commentsEnabled={commentsEnabled}
          pollSlot={pollSlot}
          whiteboardFramingSlot={whiteboardFramingSlot}
          memoFramingSlot={memoFramingSlot}
          mediaGalleryFramingSlot={mediaGalleryFramingSlot}
          collaboraFramingSlot={collaboraFramingSlot}
          callToActionFramingSlot={callToActionFramingSlot}
          hasContributions={hasContributionType}
          contributionsSlot={contributionsSlot}
          contributionsCount={callout.contributions.length}
          selectedContributionSlot={selectedContributionSlot}
          settingsSlot={settingsSlot}
          onShareClick={handleShareClick}
        />
        {whiteboardOverlay}
        {memoOverlay}
        {postOverlay}
        {framingMemoOverlay}
        {framingCollaboraOverlay}
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
            commentInputSlot={commentsEnabled ? commentInput : null}
            commentsEnabled={commentsEnabled}
            hasContributions={hasContributionType}
            contributionsSlot={contributionsSlot}
            contributionsCount={callout.contributions.length}
            selectedContributionSlot={selectedContributionSlot}
            pollSlot={pollSlot}
            whiteboardFramingSlot={whiteboardFramingSlot}
            memoFramingSlot={memoFramingSlot}
            mediaGalleryFramingSlot={mediaGalleryFramingSlot}
            collaboraFramingSlot={collaboraFramingSlot}
            callToActionFramingSlot={callToActionFramingSlot}
            settingsSlot={settingsSlot}
            onShareClick={handleShareClick}
          />
        )}
      </CalloutCommentsConnector>
      {whiteboardOverlay}
      {memoOverlay}
      {postOverlay}
      {framingMemoOverlay}
      {framingCollaboraOverlay}
      {shareDialog}
    </>
  );
}
