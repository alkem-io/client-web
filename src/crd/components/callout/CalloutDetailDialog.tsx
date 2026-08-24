import { Share2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ReferencesAndTagsStrip,
  type ReferencesAndTagsStripReference,
} from '@/crd/components/callout/ReferencesAndTagsStrip';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';

export type CalloutDetailDialogReference = ReferencesAndTagsStripReference;

export type CalloutDetailDialogData = {
  id: string;
  title: string;
  author?: {
    name: string;
    avatarUrl?: string;
    profileUrl?: string;
    role?: string;
  };
  description?: string;
  timestamp?: string;
  commentCount?: number;
  reactionCount?: number;
  /** Default-tagset tags, displayed as a compact pill row below the title (MUI `CalloutHeader` parity). */
  tags?: string[];
  /** External references, rendered alongside the tag strip. Clicking a reference opens its URI. */
  references?: CalloutDetailDialogReference[];
};

type CalloutDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailDialogData;
  /** CommentThread rendered here, inside the scrollable body */
  commentsSlot: ReactNode;
  /** CommentInput rendered above the thread, inside the scrollable body — omit when canComment is false */
  commentInputSlot?: ReactNode;
  /** Contributions grid rendered above the discussion section */
  contributionsSlot?: ReactNode;
  hasContributions?: boolean;
  contributionsCount?: number;
  /**
   * Inline preview of the currently-selected contribution (e.g. CalloutPostPreview).
   * Rendered BELOW the contributions grid so the user keeps the full list in view
   * while reading the selected response — mirrors the MUI flow where the
   * `CalloutContributionsHorizontalPager` + `CalloutContributionPreview` stack
   * coexist (`src/domain/collaboration/callout/CalloutView/CalloutView.tsx`).
   */
  selectedContributionSlot?: ReactNode;
  /** Poll rendered between description and reactions bar */
  pollSlot?: ReactNode;
  /** Whiteboard framing preview rendered below description (e.g. CalloutWhiteboardPreview) */
  whiteboardFramingSlot?: ReactNode;
  /** Memo framing preview rendered below description (e.g. CalloutMemoPreview) */
  memoFramingSlot?: ReactNode;
  /** Media gallery inline carousel rendered below description (e.g. CalloutMediaGalleryCarousel) */
  mediaGalleryFramingSlot?: ReactNode;
  /** Collabora document framing preview rendered below description (e.g. CalloutCollaboraPreview) */
  collaboraFramingSlot?: ReactNode;
  /** Call-to-action link button rendered below description (e.g. CalloutLinkAction) */
  callToActionFramingSlot?: ReactNode;
  /** Contributor collection (cards/map) rendered below description (feature 008) */
  contributorsFramingSlot?: ReactNode;
  /** Subspaces collection (cards) rendered below description (feature 013) */
  spacesFramingSlot?: ReactNode;
  /** Emoji reactions bar rendered below the framing content, above contributions. */
  reactionsSlot?: ReactNode;
  onShareClick?: () => void;
  /**
   * 3-dots settings slot in the sticky-header cluster. Consumer injects a
   * full menu component (e.g. `CalloutContextMenu`) with its own trigger
   * button (plan D8 / T061).
   */
  settingsSlot?: ReactNode;
  /**
   * Mirrors `callout.settings.framing.commentsEnabled`. When `false` AND there are no existing
   * messages (`callout.commentCount === 0`), the discussion section is hidden entirely. When
   * `false` but messages exist, the thread renders read-only — consumer simply omits
   * `commentInputSlot`. Default `true`.
   */
  commentsEnabled?: boolean;
  /** Escape hatch to raise the dialog above a custom overlay (e.g. the fullscreen task board at z-[100]). */
  overlayClassName?: string;
  contentClassName?: string;
  /**
   * Focused-contribution mode: render ONLY the selected contribution (its own
   * card carries the title/author + edit/delete/share/close) and the discussion
   * below — hiding the callout framing, reactions, and the contributions grid.
   * Used to present a single task (post) on top of the Tasks board.
   */
  focusedPost?: boolean;
};

export function CalloutDetailDialog({
  open,
  onOpenChange,
  callout,
  commentsSlot,
  commentInputSlot,
  contributionsSlot,
  hasContributions,
  contributionsCount,
  selectedContributionSlot,
  pollSlot,
  whiteboardFramingSlot,
  memoFramingSlot,
  mediaGalleryFramingSlot,
  collaboraFramingSlot,
  callToActionFramingSlot,
  contributorsFramingSlot,
  spacesFramingSlot,
  reactionsSlot,
  onShareClick,
  settingsSlot,
  commentsEnabled,
  overlayClassName,
  contentClassName,
  focusedPost = false,
}: CalloutDetailDialogProps) {
  const { t } = useTranslation('crd-space');
  const showDiscussion = commentsEnabled !== false || (callout.commentCount ?? 0) > 0;

  const author = callout.author;
  const authorCluster = author ? (
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10 border border-border">
        {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-card-title text-foreground">{author.name}</p>
        <p className="text-caption text-muted-foreground">
          {[callout.timestamp, author.role].filter(Boolean).join(' • ')}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName={overlayClassName}
        hideClose={focusedPost}
        className={cn(
          'w-full sm:max-w-5xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl rounded-xl',
          contentClassName
        )}
        aria-describedby="callout-dialog-description"
      >
        {/* In focused mode the selected contribution's own card carries the
            title + actions (including close), so the callout-level header is
            dropped — only the sr-only title/description remain, for a11y. */}
        {focusedPost ? (
          <>
            <DialogTitle className="sr-only">{callout.title}</DialogTitle>
            <DialogDescription id="callout-dialog-description" className="sr-only">
              {callout.author?.name}
            </DialogDescription>
          </>
        ) : (
          <div className="h-16 shrink-0 bg-background flex items-center justify-between px-6 shadow-sm border-b border-border z-20">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <DialogTitle className="text-body-emphasis leading-tight text-foreground truncate">
                  {callout.title}
                </DialogTitle>
                <DialogDescription
                  id="callout-dialog-description"
                  className="text-caption text-muted-foreground truncate"
                >
                  {callout.author?.profileUrl ? (
                    <a
                      href={callout.author.profileUrl}
                      onClick={e => e.stopPropagation()}
                      className="relative z-10 rounded-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {callout.author.name}
                    </a>
                  ) : (
                    callout.author?.name
                  )}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                aria-label={t('calloutDialog.share')}
                onClick={onShareClick}
              >
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </Button>
              {settingsSlot}
              <div className="w-px h-6 bg-border mx-2" aria-hidden="true" />
              <DialogClose asChild={true}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                  aria-label={t('calloutDialog.close')}
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </Button>
              </DialogClose>
            </div>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full px-6 md:px-10 pb-6">
            {/* Callout framing (title/author/description/framing previews). Hidden
                in focused mode — the single contribution stands on its own. */}
            {!focusedPost && (
              <div className="py-8 space-y-5">
                <h1 className="text-page-title text-foreground">{callout.title}</h1>

                {authorCluster &&
                  (author?.profileUrl ? (
                    <a
                      href={author.profileUrl}
                      onClick={e => e.stopPropagation()}
                      className="relative z-10 block rounded-md -mx-1 px-1 py-0.5 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {authorCluster}
                    </a>
                  ) : (
                    authorCluster
                  ))}

                {callout.description && (
                  <MarkdownContent content={callout.description} className="text-foreground/90" />
                )}

                <ReferencesAndTagsStrip references={callout.references} tags={callout.tags} />

                {whiteboardFramingSlot && <div className="pt-2">{whiteboardFramingSlot}</div>}
                {memoFramingSlot && <div className="pt-2">{memoFramingSlot}</div>}
                {mediaGalleryFramingSlot && <div className="pt-2">{mediaGalleryFramingSlot}</div>}
                {collaboraFramingSlot && <div className="pt-2">{collaboraFramingSlot}</div>}
                {callToActionFramingSlot && <div className="pt-2">{callToActionFramingSlot}</div>}
                {contributorsFramingSlot && <div className="pt-2">{contributorsFramingSlot}</div>}
                {spacesFramingSlot && <div className="pt-2">{spacesFramingSlot}</div>}
                {pollSlot && <div className="pt-2">{pollSlot}</div>}
              </div>
            )}

            {/* Reactions bar — provided by the connector layer; renders nothing
                when the server module is not yet deployed (undefined summary). */}
            {!focusedPost && reactionsSlot && <div className="py-3 border-b border-border">{reactionsSlot}</div>}

            {/* In focused mode, only the selected contribution renders (its own card
                carries the header + actions). Otherwise the full contributions grid
                stays visible so the user can switch between responses, with the
                inline preview below it. */}
            {focusedPost
              ? selectedContributionSlot && (
                  <div className="py-6 border-b border-border">{selectedContributionSlot}</div>
                )
              : hasContributions &&
                (contributionsSlot || selectedContributionSlot) && (
                  <div className="py-8 border-b border-border space-y-6">
                    {contributionsSlot && (
                      <>
                        <div className="flex items-center gap-2 mb-6">
                          <h2 className="text-section-title text-foreground">{t('calloutDialog.contributions')}</h2>
                          {contributionsCount !== undefined && (
                            <Badge variant="secondary" className="rounded-full px-2">
                              {contributionsCount}
                            </Badge>
                          )}
                        </div>
                        {contributionsSlot}
                      </>
                    )}
                    {selectedContributionSlot}
                  </div>
                )}

            {/* Discussion section — hidden entirely when commenting is disabled and no messages exist
                (mirrors MUI behavior); read-only thread shown when disabled but messages exist (the
                consumer omits `commentInputSlot` in that case). */}
            {showDiscussion && (
              <div className="pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-section-title text-foreground">{t('calloutDialog.discussion')}</h2>
                  {callout.commentCount !== undefined && (
                    <Badge variant="secondary" className="rounded-full px-2">
                      {callout.commentCount}
                    </Badge>
                  )}
                </div>
                {commentInputSlot && <div className="mb-4">{commentInputSlot}</div>}
                {commentsSlot}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
