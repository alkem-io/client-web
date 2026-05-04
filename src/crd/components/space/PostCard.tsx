import {
  BarChart3,
  ChevronDown,
  FileText,
  ImagePlus,
  Images,
  type LucideIcon,
  Maximize2,
  Megaphone,
  MessageSquare,
  Presentation,
  StickyNote,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutLinkAction } from '@/crd/components/callout/CalloutLinkAction';
import { ExpandableMarkdown } from '@/crd/components/common/ExpandableMarkdown';
import {
  MediaGalleryFeedGrid,
  type MediaGalleryFeedThumbnail,
} from '@/crd/components/mediaGallery/MediaGalleryFeedGrid';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/crd/primitives/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/crd/primitives/collapsible';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';

export type PostType = 'text' | 'whiteboard' | 'memo' | 'mediaGallery' | 'callToAction' | 'poll';

type PostTypeLabelKey =
  | 'callout.post'
  | 'callout.whiteboard'
  | 'callout.memo'
  | 'callout.mediaGallery'
  | 'callout.callToAction'
  | 'callout.poll';

/**
 * Single source of truth for the icon and translation key per `PostType`.
 * Adding a new framing type means adding one entry here — the typed Record
 * forces every `PostType` to be covered, so the icon and label can never
 * silently fall through to the wrong default. Label keys are typed as a
 * literal union so the strict-typed `t()` (see `@types/i18next.d.ts`) accepts
 * them without a cast.
 */
export const POST_TYPE_DESCRIPTORS: Record<PostType, { icon: LucideIcon; labelKey: PostTypeLabelKey }> = {
  text: { icon: FileText, labelKey: 'callout.post' },
  whiteboard: { icon: Presentation, labelKey: 'callout.whiteboard' },
  memo: { icon: StickyNote, labelKey: 'callout.memo' },
  mediaGallery: { icon: Images, labelKey: 'callout.mediaGallery' },
  callToAction: { icon: Megaphone, labelKey: 'callout.callToAction' },
  poll: { icon: BarChart3, labelKey: 'callout.poll' },
};

export type PostCardData = {
  id: string;
  type: PostType;
  author?: {
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  title: string;
  snippet?: string;
  timestamp?: string;
  isDraft?: boolean;
  /** Framing-level preview image (whiteboard framing only) */
  framingImageUrl?: string;
  /** Framing-level memo markdown (memo framing only) — rendered as a compact cropped preview in the feed */
  framingMemoMarkdown?: string;
  /**
   * Framing-level media gallery preview (media gallery framing only) — up to 4 thumbnails
   * as `{ id, url }` pairs; the feed grid shows a "+N more" overlay on the 4th cell when
   * `totalCount > thumbnails.length`. Using `id` as the React key keeps rows stable across
   * reorders / deletions even when image URLs change.
   */
  framingMediaGallery?: { thumbnails: MediaGalleryFeedThumbnail[]; totalCount: number };
  /** Framing-level call-to-action link (Link framing only). `isValid` is false for non-http(s) or malformed URIs. */
  framingCallToAction?: { uri: string; displayName: string; isExternal: boolean; isValid: boolean };
  commentCount?: number;
  /**
   * Mirrors `callout.settings.framing.commentsEnabled`. When `false`:
   *  - the comments footer is hidden entirely if there are no existing messages
   *  - existing messages stay visible (read-only) when there are some — input gating is the consumer's call (`commentInputSlot`).
   * Default `true` (legacy callsites stay unchanged).
   */
  commentsEnabled?: boolean;
};

type PostCardProps = {
  post: PostCardData;
  /** URL for the callout title link. Falls back to onClick when omitted. */
  href?: string;
  onClick?: () => void;
  /**
   * Fired when the user clicks "Open Whiteboard" / "Open Memo" inside the framing
   * preview. When omitted, the buttons fall back to `onClick` (i.e. open the
   * callout dialog). Consumers wire this to launch the framing editor directly.
   */
  onOpenFraming?: () => void;
  /**
   * Fired when the user clicks "Add images" on a media-gallery framing preview.
   * When omitted, the button is hidden. Consumer wires this to a hidden file
   * picker + direct upload, matching the dialog-level flow.
   */
  onAddMediaGalleryImages?: () => void;
  /**
   * Fallback handler for the footer when no `commentsSlot` is provided — e.g.
   * the standalone preview app or future callers that want a dialog-only flow.
   * When `commentsSlot` is supplied the footer becomes a collapsible and this
   * prop is ignored.
   */
  onCommentsClick?: () => void;
  /**
   * 3-dots settings area rendered in the card header. The consumer provides a full
   * menu component (e.g. `CalloutContextMenu`) that brings its own `DropdownMenuTrigger`
   * button — this card never renders a standalone settings button (plan D8 / T060).
   */
  settingsSlot?: ReactNode;
  onExpandClick?: () => void;
  /** Contribution preview rendered by the integration layer (ContributionsPreviewConnector) */
  contributionsPreview?: ReactNode;
  /** Content injected after the description/preview area, before the footer (e.g. poll) */
  children?: ReactNode;
  /**
   * Full comment thread rendered inside the expanded footer. When supplied the
   * footer renders a `<Collapsible>` with a chevron-toggle trigger. The
   * integration layer (`CalloutCommentsConnector`) provides the node.
   */
  commentsSlot?: ReactNode;
  /**
   * Comment input rendered above the thread inside the expanded footer.
   * Consumer passes `null` when the viewer cannot post.
   */
  commentInputSlot?: ReactNode | null;
  /**
   * Emits on every open/close of the inline comments footer. The integration
   * layer uses this to gate the live subscription (see
   * `CalloutCommentsConnector.skipSubscription`).
   */
  onCommentsExpandedChange?: (expanded: boolean) => void;
  className?: string;
};

export function PostCard({
  post,
  href,
  onClick,
  onOpenFraming,
  onAddMediaGalleryImages,
  onCommentsClick,
  settingsSlot,
  onExpandClick,
  contributionsPreview,
  children,
  commentsSlot,
  commentInputSlot,
  onCommentsExpandedChange,
  className,
}: PostCardProps) {
  const { t } = useTranslation('crd-space');
  const TypeIcon = POST_TYPE_DESCRIPTORS[post.type].icon;
  const hasCollapsibleComments = commentsSlot !== undefined;
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleCommentsOpenChange = (open: boolean) => {
    setIsCommentsOpen(open);
    onCommentsExpandedChange?.(open);
  };

  const commentLabel = post.commentCount
    ? t('callout.comments', { count: post.commentCount })
    : t('callout.commentsZero');

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-6 space-y-0">
        <div className="flex gap-3">
          {post.author && (
            <Avatar className="w-10 h-10 border border-border">
              {post.author.avatarUrl && <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />}
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2">
              {post.author && <span className="text-card-title text-foreground">{post.author.name}</span>}
              {post.timestamp && <span className="text-caption text-muted-foreground">• {post.timestamp}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {post.author?.role && (
                <Badge variant="secondary" className="text-badge h-5 px-1.5 font-normal">
                  {post.author.role}
                </Badge>
              )}
              {post.isDraft && (
                <Badge variant="outline" className="text-badge h-5 px-1.5 font-normal text-amber-600 border-amber-300">
                  {t('callout.draft')}
                </Badge>
              )}
              <span className="text-caption text-muted-foreground flex items-center gap-1">
                <TypeIcon className="w-4 h-4" aria-hidden="true" />
                {t(POST_TYPE_DESCRIPTORS[post.type].labelKey)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onExpandClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={e => {
                e.stopPropagation();
                onExpandClick();
              }}
              aria-label={t('callout.expand')}
            >
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          {settingsSlot}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-3">
        <h3 className="text-subsection-title font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
          <a
            href={href ?? '#'}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            onClick={
              onClick
                ? e => {
                    e.preventDefault();
                    onClick();
                  }
                : undefined
            }
          >
            {post.title}
          </a>
        </h3>
        {post.snippet && <ExpandableMarkdown content={post.snippet} maxLines={3} className="mb-4" />}

        {/* Whiteboard framing preview — always render (even when empty), MUI parity. */}
        {post.type === 'whiteboard' && (
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video">
            {post.framingImageUrl ? (
              <img
                src={post.framingImageUrl}
                alt={t('callout.whiteboard')}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Presentation className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Button
                variant="secondary"
                className="shadow-sm"
                onClick={event => {
                  event.stopPropagation();
                  (onOpenFraming ?? onClick)?.();
                }}
              >
                {t('callout.openWhiteboard')}
              </Button>
            </div>
          </div>
        )}

        {/* Memo framing preview — fixed-height box; renders icon centred when empty. */}
        {post.type === 'memo' && (
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 h-32">
            {post.framingMemoMarkdown ? (
              <div className="p-3 h-full">
                <CroppedMarkdown content={post.framingMemoMarkdown} maxHeight="100%" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <StickyNote className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-primary/0 group-hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                className="shadow-sm"
                onClick={event => {
                  event.stopPropagation();
                  (onOpenFraming ?? onClick)?.();
                }}
              >
                {t('callout.openMemo')}
              </Button>
            </div>
          </div>
        )}

        {/* Media gallery framing preview — 4-tile grid; falls back to a placeholder
            (icon-centred empty box) when there are no images yet so the gallery has
            a visible affordance in the feed. Mirrors the whiteboard / memo empty-state
            pattern. The "Add images" button below opens the OS file picker directly
            (MUI parity — no edit-dialog round-trip). */}
        {post.type === 'mediaGallery' && (
          <div className="space-y-2">
            {post.framingMediaGallery && post.framingMediaGallery.thumbnails.length > 0 ? (
              <MediaGalleryFeedGrid
                thumbnails={post.framingMediaGallery.thumbnails}
                totalCount={post.framingMediaGallery.totalCount}
                onOpenAt={onClick}
              />
            ) : (
              <div className="rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video flex items-center justify-center">
                <Images className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
            {onAddMediaGalleryImages && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={event => {
                    event.stopPropagation();
                    onAddMediaGalleryImages();
                  }}
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  {t('mediaGallery.emptyState.action')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Call-to-action framing preview — full-width link button */}
        {post.type === 'callToAction' && post.framingCallToAction && (
          <CalloutLinkAction
            url={post.framingCallToAction.uri}
            displayName={post.framingCallToAction.displayName}
            isExternal={post.framingCallToAction.isExternal}
            isValid={post.framingCallToAction.isValid}
            className="mt-4"
          />
        )}

        {/* Contribution previews — rendered by integration layer */}
        {contributionsPreview}
      </CardContent>

      {children && <div className="px-6 pb-4">{children}</div>}

      {/* Footer is hidden entirely when comments are disabled AND there are no existing messages —
          mirrors the MUI behavior. When messages exist, the thread stays visible (read-only via
          consumer-gated `commentInputSlot`) even after the admin disables further commenting. */}
      {(post.commentsEnabled !== false || (post.commentCount ?? 0) > 0) &&
        (hasCollapsibleComments ? (
          <CardFooter className="!p-0 flex-col items-stretch gap-0 border-t bg-muted/5">
            <Collapsible open={isCommentsOpen} onOpenChange={handleCommentsOpenChange}>
              <CollapsibleTrigger asChild={true}>
                <button
                  type="button"
                  className="group/comments flex w-full items-center gap-2 px-6 py-3 text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t(isCommentsOpen ? 'callout.collapseComments' : 'callout.expandComments')}
                >
                  <ChevronDown
                    className="size-4 transition-transform duration-200 group-data-[state=open]/comments:rotate-180"
                    aria-hidden="true"
                  />
                  <MessageSquare className="size-4" aria-hidden="true" />
                  <span>{commentLabel}</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-4">
                <div className="flex flex-col gap-3">
                  {commentInputSlot}
                  <div className="max-h-[400px] overflow-y-auto pr-2">{commentsSlot}</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardFooter>
        ) : (
          <CardFooter className="!py-3 flex items-center gap-4 border-t bg-muted/5 px-6">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
              onClick={event => {
                event.stopPropagation();
                onCommentsClick?.();
              }}
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span className="text-caption">{commentLabel}</span>
            </Button>
          </CardFooter>
        ))}
    </Card>
  );
}
