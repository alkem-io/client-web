import { FileText, Images, Maximize2, MessageSquare, MoreHorizontal, Presentation, StickyNote } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import {
  MediaGalleryFeedGrid,
  type MediaGalleryFeedThumbnail,
} from '@/crd/components/mediaGallery/MediaGalleryFeedGrid';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/crd/primitives/card';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';

export type PostType = 'text' | 'whiteboard' | 'memo' | 'mediaGallery';

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
  commentCount?: number;
};

type PostCardProps = {
  post: PostCardData;
  /** URL for the callout title link. Falls back to onClick when omitted. */
  href?: string;
  onClick?: () => void;
  onCommentsClick?: () => void;
  onSettingsClick?: () => void;
  onExpandClick?: () => void;
  /** Contribution preview rendered by the integration layer (ContributionsPreviewConnector) */
  contributionsPreview?: ReactNode;
  /** Content injected after the description/preview area, before the footer (e.g. poll) */
  children?: ReactNode;
  className?: string;
};

const typeIcons: Record<PostType, typeof FileText> = {
  text: FileText,
  whiteboard: Presentation,
  memo: StickyNote,
  mediaGallery: Images,
};

const typeLabels = {
  text: 'callout.post',
  whiteboard: 'callout.whiteboard',
  memo: 'callout.memo',
  mediaGallery: 'callout.mediaGallery',
} as const;

export function PostCard({
  post,
  href,
  onClick,
  onCommentsClick,
  onSettingsClick,
  onExpandClick,
  contributionsPreview,
  children,
  className,
}: PostCardProps) {
  const { t } = useTranslation('crd-space');
  const TypeIcon = typeIcons[post.type];

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
                {t(typeLabels[post.type])}
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
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={e => {
                e.stopPropagation();
                onSettingsClick();
              }}
              aria-label={t('mobile.settings')}
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
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
        {post.snippet && <MarkdownContent content={post.snippet} className="text-muted-foreground line-clamp-3 mb-4" />}

        {/* Whiteboard framing preview */}
        {post.type === 'whiteboard' && post.framingImageUrl && (
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video">
            <img
              src={post.framingImageUrl}
              alt={t('callout.whiteboard')}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Button variant="secondary" className="shadow-sm" onClick={onClick}>
                {t('callout.openWhiteboard')}
              </Button>
            </div>
          </div>
        )}

        {/* Memo framing preview */}
        {post.type === 'memo' && post.framingMemoMarkdown && (
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
            <div className="p-3">
              <CroppedMarkdown content={post.framingMemoMarkdown} maxHeight="12rem" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-primary/0 group-hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100">
              <Button variant="secondary" className="shadow-sm" onClick={onClick}>
                {t('callout.openMemo')}
              </Button>
            </div>
          </div>
        )}

        {/* Media gallery framing preview — 4-tile grid matching whiteboard-contribution layout */}
        {post.type === 'mediaGallery' && post.framingMediaGallery && post.framingMediaGallery.thumbnails.length > 0 && (
          <MediaGalleryFeedGrid
            thumbnails={post.framingMediaGallery.thumbnails}
            totalCount={post.framingMediaGallery.totalCount}
            onOpenAt={onClick}
          />
        )}

        {/* Contribution previews — rendered by integration layer */}
        {contributionsPreview}
      </CardContent>

      {children && <div className="px-6 pb-4">{children}</div>}

      <CardFooter className="px-6 py-3 border-t bg-muted/5 flex items-center gap-4">
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
          <span className="text-caption">
            {post.commentCount ? t('callout.comments', { count: post.commentCount }) : t('callout.commentsZero')}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
