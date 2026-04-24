import { MoreHorizontal, Share2, Smile, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';

export type CalloutDetailDialogData = {
  id: string;
  title: string;
  author?: {
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  description?: string;
  timestamp?: string;
  commentCount?: number;
  reactionCount?: number;
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
  onReactionsClick?: () => void;
  onShareClick?: () => void;
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
  pollSlot,
  whiteboardFramingSlot,
  memoFramingSlot,
  mediaGalleryFramingSlot,
  collaboraFramingSlot,
  callToActionFramingSlot,
  onReactionsClick,
  onShareClick,
}: CalloutDetailDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-5xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl rounded-xl"
        aria-describedby="callout-dialog-description"
      >
        {/* Sticky header */}
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
                {callout.author?.name}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              aria-label={t('calloutDialog.share')}
            >
              <Share2 className="w-5 h-5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              aria-label={t('calloutDialog.more')}
            >
              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
            </Button>
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full px-6 md:px-10 pb-6">
            {/* Title + author */}
            <div className="py-8 space-y-5">
              <h1 className="text-page-title text-foreground">{callout.title}</h1>

              {callout.author && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    {callout.author.avatarUrl && (
                      <AvatarImage src={callout.author.avatarUrl} alt={callout.author.name} />
                    )}
                    <AvatarFallback>{callout.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-card-title text-foreground">{callout.author.name}</p>
                    <p className="text-caption text-muted-foreground">
                      {callout.timestamp}
                      {callout.author.role && ` • ${callout.author.role}`}
                    </p>
                  </div>
                </div>
              )}

              {callout.description && <MarkdownContent content={callout.description} className="text-foreground/90" />}

              {whiteboardFramingSlot && <div className="pt-2">{whiteboardFramingSlot}</div>}
              {memoFramingSlot && <div className="pt-2">{memoFramingSlot}</div>}
              {mediaGalleryFramingSlot && <div className="pt-2">{mediaGalleryFramingSlot}</div>}
              {collaboraFramingSlot && <div className="pt-2">{collaboraFramingSlot}</div>}
              {callToActionFramingSlot && <div className="pt-2">{callToActionFramingSlot}</div>}
              {pollSlot && <div className="pt-2">{pollSlot}</div>}
            </div>

            {/* Reactions + share bar */}
            <div className="flex items-center gap-4 py-4 border-y border-border">
              {callout.reactionCount !== undefined && callout.reactionCount > 0 && (
                <span className="text-body-emphasis text-muted-foreground">
                  {t('calloutDialog.reactionCount', { count: callout.reactionCount })}
                </span>
              )}
              <div className="flex-1" />
              <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={onReactionsClick}>
                <Smile className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                {t('calloutDialog.reactions')}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={onShareClick}>
                <Share2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                {t('calloutDialog.share')}
              </Button>
            </div>

            {/* Contributions section */}
            {hasContributions && contributionsSlot && (
              <div className="py-8 border-b border-border">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-section-title text-foreground">{t('calloutDialog.contributions')}</h2>
                  {contributionsCount !== undefined && (
                    <Badge variant="secondary" className="rounded-full px-2">
                      {contributionsCount}
                    </Badge>
                  )}
                </div>
                {contributionsSlot}
              </div>
            )}

            {/* Discussion section */}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
