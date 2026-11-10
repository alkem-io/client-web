import { Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { ContributionDocumentCard } from '@/crd/components/contribution/ContributionDocumentCard';
import { CONTRIBUTION_GRID_COLUMNS } from '@/crd/components/contribution/ContributionGrid';
import { ContributionLinkList } from '@/crd/components/contribution/ContributionLinkList';
import { ContributionMemoCard } from '@/crd/components/contribution/ContributionMemoCard';
import { ContributionPostCard } from '@/crd/components/contribution/ContributionPostCard';
import { ContributionsPreviewSkeleton } from '@/crd/components/contribution/ContributionsPreviewSkeleton';
import { ContributionWhiteboardCard } from '@/crd/components/contribution/ContributionWhiteboardCard';
import { useGridColumnCount } from '@/crd/hooks/useGridColumnCount';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutCollaborationPermissions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions';
import useCalloutContributions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions';
import {
  getCalloutContributionType,
  mapContributionTypeToPreviewKind,
} from '@/main/crdPages/space/dataMappers/calloutDataMapper';
import {
  type ContributionCardData,
  mapAnyContributionToCardData,
  mapContributionToLinkItem,
} from '../dataMappers/contributionDataMapper';
import { DocumentContributionAddConnector } from './DocumentContributionAddConnector';
import { LinkContributionAddConnector } from './LinkContributionAddConnector';
import { LinkContributionEditConnector } from './LinkContributionEditConnector';
import { MemoContributionAddConnector } from './MemoContributionAddConnector';
import { PostContributionAddConnector } from './PostContributionAddConnector';
import { WhiteboardContributionAddConnector } from './WhiteboardContributionAddConnector';

/** The card grid previews two rows of whatever column count it renders; the last slot becomes "+N more". */
const PREVIEW_ROWS = 2;
const PREVIEW_COLUMNS = 3;
/** Enough for two rows at the widest layout. */
const PREVIEW_PAGE_SIZE = PREVIEW_ROWS * PREVIEW_COLUMNS;
/** The link list is not a grid: it keeps a fixed four slots. */
const LINK_PREVIEW_SLOTS = 4;

type ContributionsPreviewConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onContributionClick?: (contributionId: string, memoId?: string) => void;
  onOpenMemoSignedCopies?: (memoId: string) => void;
  /**
   * True when this callout renders as a Tasks board. Retitles the section
   * header "Tasks (N)" instead of "Contributions (N)". Resolved asynchronously
   * by the parent (`LazyCalloutItem`); ordinary callouts leave it false.
   */
  isTaskBoard?: boolean;
};

export function ContributionsPreviewConnector({
  callout,
  onContributionClick,
  onOpenMemoSignedCopies,
  isTaskBoard,
}: ContributionsPreviewConnectorProps) {
  const { t, i18n } = useTranslation('crd-space');
  const locale = resolveDateFnsLocale(i18n.language);

  const contributionType = getCalloutContributionType(callout);
  // Section visibility follows MUI's `CalloutView` — driven by the presence of
  // `allowedTypes`, not the `enabled` flag. Turning both Members/Admins switches
  // off sets `enabled: false` + `canAddContributions: None`, but the callout is
  // still "a memo callout that collects memos" and existing contributions must
  // stay reachable. The Add tile is gated separately on `canCreateContribution`.
  const hasContributionType = !!contributionType;

  const { canCreateContribution } = useCalloutCollaborationPermissions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
  });

  const {
    inViewRef,
    loaded,
    contributions: { items, total, setFetchAll },
  } = useCalloutContributions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
    pageSize: PREVIEW_PAGE_SIZE,
    skip: !hasContributionType,
  });

  const contributions = items
    .map(item => mapAnyContributionToCardData(item, locale))
    .filter(Boolean) as ContributionCardData[];

  // The add affordance moved from a trailing in-grid "+ Add" tile to a single `+` icon button in
  // the section header (see `header` below). MUI parity: `CalloutContributionsBlock` places the
  // create-button in the header next to the count. Rationale: the previous design hid the add
  // affordance the moment the grid filled to 4 items (the dashed "+N more" tile replaced it),
  // forcing users to open the detail dialog just to add another contribution.
  const defaults = callout.contributionDefaults;
  const [addOpen, setAddOpen] = useState(false);

  const addConnector: ReactNode =
    canCreateContribution && contributionType ? (
      contributionType === CalloutContributionType.Whiteboard ? (
        <WhiteboardContributionAddConnector
          inlineTrigger={true}
          open={addOpen}
          onOpenChange={setAddOpen}
          calloutId={callout.id}
          defaultDisplayName={defaults?.defaultDisplayName}
        />
      ) : contributionType === CalloutContributionType.Memo ? (
        <MemoContributionAddConnector
          inlineTrigger={true}
          open={addOpen}
          onOpenChange={setAddOpen}
          calloutId={callout.id}
          // Posts and Memos share `contributionDefaults.defaultDisplayName` + `postDescription`
          // (FR-33 / FR-42 / FR-43). Mirror the Post branch below — without these the create-memo
          // dialog opens with the i18n fallback title and an empty body. T157, 2026-05-19; same
          // bug present here on the feed-level preview surface as in `CalloutDetailDialogConnector`.
          defaultDisplayName={defaults?.defaultDisplayName}
          defaultMarkdown={defaults?.postDescription}
        />
      ) : contributionType === CalloutContributionType.Post ? (
        <PostContributionAddConnector
          inlineTrigger={true}
          open={addOpen}
          onOpenChange={setAddOpen}
          calloutId={callout.id}
          isTaskBoard={isTaskBoard}
          defaultDisplayName={defaults?.defaultDisplayName}
          defaultDescription={defaults?.postDescription}
        />
      ) : contributionType === CalloutContributionType.Link ? (
        <LinkContributionAddConnector
          inlineTrigger={true}
          open={addOpen}
          onOpenChange={setAddOpen}
          calloutId={callout.id}
        />
      ) : contributionType === CalloutContributionType.CollaboraDocument ? (
        <DocumentContributionAddConnector
          inlineTrigger={true}
          open={addOpen}
          onOpenChange={setAddOpen}
          calloutId={callout.id}
          calloutPrivileges={callout.authorization?.myPrivileges}
        />
      ) : null
    ) : null;

  // Same per-type labels the in-grid placeholders used to show (`ContributionAddCard.label`),
  // now rendered as the visible text on the header button. The button text doubles as the
  // accessible name, so no separate `aria-label` is needed.
  const addLabel =
    contributionType === CalloutContributionType.Whiteboard
      ? t('callout.addWhiteboard')
      : contributionType === CalloutContributionType.Memo
        ? t('callout.addMemo')
        : contributionType === CalloutContributionType.Post
          ? t('callout.addPost')
          : contributionType === CalloutContributionType.Link
            ? t('callout.addLinkOrFile')
            : contributionType === CalloutContributionType.CollaboraDocument
              ? t('callout.addDocument')
              : '';

  // Link-list edit state. The "+ Add link" action lives in the section-header `+` button alongside
  // every other contribution type (see `addConnector` above); per-row Edit / Delete still need their
  // own state here.
  const [linkEditTarget, setLinkEditTarget] = useState<
    | {
        contributionId: string;
        linkId: string;
        url: string;
        displayName: string;
        description?: string;
        canDelete: boolean;
        intent?: 'edit' | 'delete';
      }
    | undefined
  >(undefined);

  const [columnCount, setGridNode] = useGridColumnCount();
  // The page holds two rows at the widest layout, so a narrower grid can be fully fetched and still
  // collapsed: the expansion is tracked here rather than read from the fetch state.
  const [expanded, setExpanded] = useState(false);

  // "+N more" expands the preview in place; the detail dialog stays behind the post title.
  const showAll = () => {
    setExpanded(true);
    setFetchAll(true);
  };

  if (!hasContributionType || !contributionType) {
    return <div ref={inViewRef} />;
  }

  const slots = contributionType === CalloutContributionType.Link ? LINK_PREVIEW_SLOTS : PREVIEW_ROWS * columnCount;
  const hasMore = !expanded && total > slots;
  const itemsBeforeMore = slots - 1;
  const visibleItems = hasMore ? contributions.slice(0, itemsBeforeMore) : contributions;
  const moreCount = total - itemsBeforeMore;

  // The contributions page is fetched lazily (own in-view observer + round-trip), so
  // for a while the card would show `Contributions (0)` and no grid, then grow when the
  // page lands. The details fragment already carries one stub per contribution — use
  // its length for the header count and to size a same-footprint placeholder until the
  // real page arrives (issue #10043).
  const expectedCount = callout.contributions.length;
  const displayedTotal = loaded ? total : expectedCount;
  const loadingBody =
    !loaded && expectedCount > 0 ? (
      <output className="block" aria-label={t('a11y.loadingContributions')}>
        <ContributionsPreviewSkeleton
          kind={mapContributionTypeToPreviewKind(contributionType)}
          count={expectedCount}
          columns={PREVIEW_COLUMNS}
        />
      </output>
    ) : undefined;

  // MUI parity (`CalloutContributionsBlock`): a `Contributions (n)` header
  // anchors the section so the callout's nature is obvious even with zero
  // contributions and contributions disabled. Without the header, a memo
  // callout whose toggles are off looks like a plain post in the feed and
  // there's no signal that contributions ever lived here.
  //
  // The header also hosts the `+` icon button that opens the create-contribution dialog
  // (any type — Post/Memo/Whiteboard/Link). This replaces the in-grid "+ Add" tile, which
  // disappeared when the section filled up to its preview slots and forced users into the
  // detail dialog just to add another contribution.
  const header = (
    <div className="mt-4 mb-2 flex items-center justify-between gap-2">
      <p className="text-label uppercase text-muted-foreground">
        {isTaskBoard
          ? t('callout.tasksHeader', { count: displayedTotal })
          : t('callout.contributionsHeader', { count: displayedTotal })}
      </p>
      {canCreateContribution && addLabel && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" aria-hidden="true" />
          {addLabel}
        </Button>
      )}
    </div>
  );

  // Links render as a list, not a card grid.
  if (contributionType === CalloutContributionType.Link) {
    const links = contributions.map(mapContributionToLinkItem);

    const openLinkTarget = (contributionId: string, intent: 'edit' | 'delete') => {
      const c = contributions.find(item => item.id === contributionId);
      if (!c || !c.linkId) return;
      setLinkEditTarget({
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
      <div ref={inViewRef}>
        {header}
        {loadingBody ?? (
          <>
            {contributions.length > 0 && (
              <ContributionLinkList
                links={hasMore ? links.slice(0, itemsBeforeMore) : links}
                canAdd={false}
                onEdit={id => openLinkTarget(id, 'edit')}
                onDelete={id => openLinkTarget(id, 'delete')}
              />
            )}
            {hasMore && (
              <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={showAll}>
                {t('callout.moreContributions', { count: moreCount })}
              </Button>
            )}
          </>
        )}
        {addConnector}
        <LinkContributionEditConnector
          calloutId={callout.id}
          target={linkEditTarget}
          canDelete={linkEditTarget?.canDelete}
          onClose={() => setLinkEditTarget(undefined)}
        />
      </div>
    );
  }

  // Image-like contribution types (Whiteboard, Memo) use the "+N more" overlay on the last visible card.
  // Text-like types (Post) use a dashed "+N more" card.
  const usesOverlayPattern =
    contributionType === CalloutContributionType.Whiteboard || contributionType === CalloutContributionType.Memo;

  if (usesOverlayPattern && hasMore) {
    const lastContribution = contributions[itemsBeforeMore];
    return (
      <div ref={inViewRef}>
        {header}
        <div ref={setGridNode} className={cn('grid gap-3', CONTRIBUTION_GRID_COLUMNS[PREVIEW_COLUMNS])}>
          {visibleItems.map(contribution => (
            <ContributionCard
              key={contribution.id}
              contribution={contribution}
              contributionType={contributionType}
              onClick={() => onContributionClick?.(contribution.id, contribution.memoId)}
              onOpenMemoSignedCopies={onOpenMemoSignedCopies}
            />
          ))}
          <OverlayMoreCard
            lastContribution={lastContribution}
            contributionType={contributionType}
            label={t('callout.moreContributions', { count: moreCount })}
            onClick={showAll}
          />
        </div>
        {addConnector}
      </div>
    );
  }

  // Default branch: header + grid. Renders even when the grid is empty (header
  // alone signals "this is a contribution-collecting callout, currently 0").
  return (
    <div ref={inViewRef}>
      {header}
      {loadingBody ??
        ((visibleItems.length > 0 || hasMore) && (
          <div ref={setGridNode} className={cn('grid gap-3', CONTRIBUTION_GRID_COLUMNS[PREVIEW_COLUMNS])}>
            {visibleItems.map(contribution => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                contributionType={contributionType}
                onClick={() => onContributionClick?.(contribution.id, contribution.memoId)}
                onOpenMemoSignedCopies={onOpenMemoSignedCopies}
              />
            ))}
            {hasMore && (
              <button
                type="button"
                className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground text-card-title min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={showAll}
              >
                {t('callout.moreContributions', { count: moreCount })}
              </button>
            )}
          </div>
        ))}
      {addConnector}
    </div>
  );
}

function OverlayMoreCard({
  lastContribution,
  contributionType,
  label,
  onClick,
}: {
  lastContribution: ContributionCardData | undefined;
  contributionType: CalloutContributionType;
  label: string;
  onClick: () => void;
}) {
  const showImage = contributionType === CalloutContributionType.Whiteboard && lastContribution?.previewUrl;
  const showMemoPreview = contributionType === CalloutContributionType.Memo && lastContribution?.markdownContent;

  return (
    <button
      type="button"
      className={
        'relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[180px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      }
      onClick={onClick}
    >
      {showImage && <img src={lastContribution.previewUrl} alt="" className="w-full h-full object-cover" />}
      {showMemoPreview && lastContribution.markdownContent && (
        <div className="p-4 h-full text-left">
          <CroppedMarkdown content={lastContribution.markdownContent} maxHeight="180px" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
        <span className="text-white font-bold text-subsection-title">{label}</span>
      </div>
    </button>
  );
}

function ContributionCard({
  contribution,
  contributionType,
  onClick,
  onOpenMemoSignedCopies,
}: {
  contribution: ContributionCardData;
  contributionType: CalloutContributionType;
  onClick?: () => void;
  onOpenMemoSignedCopies?: (memoId: string) => void;
}) {
  switch (contributionType) {
    case CalloutContributionType.Whiteboard:
      return (
        <ContributionWhiteboardCard
          title={contribution.title}
          previewUrl={contribution.previewUrl}
          author={contribution.author?.name}
          onClick={onClick}
        />
      );
    case CalloutContributionType.Post:
      return (
        <ContributionPostCard
          title={contribution.title}
          author={contribution.author}
          createdDate={contribution.createdDate}
          description={contribution.description}
          tags={contribution.tags}
          commentCount={contribution.commentCount}
          onClick={onClick}
        />
      );
    case CalloutContributionType.Memo: {
      const memoId = contribution.memoId;
      return (
        <ContributionMemoCard
          title={contribution.title}
          markdownContent={contribution.markdownContent}
          author={contribution.author?.name}
          onClick={onClick}
          signedCopiesCount={contribution.signedCopiesCount}
          onOpenSignedCopies={memoId && onOpenMemoSignedCopies ? () => onOpenMemoSignedCopies(memoId) : undefined}
        />
      );
    }
    case CalloutContributionType.CollaboraDocument:
      return (
        <ContributionDocumentCard
          title={contribution.title}
          documentType={contribution.documentType ?? 'text'}
          previewUrl={contribution.previewUrl}
          author={contribution.author?.name}
          onClick={onClick}
        />
      );
    default:
      return null;
  }
}
