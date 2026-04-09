import { MoreHorizontal, Share2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
  imageUrl?: string;
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
  /** CommentInput rendered in sticky footer — omit when canComment is false */
  commentInputSlot?: ReactNode;
  /** Contributions grid rendered above the discussion section */
  contributionsSlot?: ReactNode;
  hasContributions?: boolean;
  contributionsCount?: number;
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
            <DialogClose asChild={true}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full shrink-0"
                aria-label={t('calloutDialog.close')}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </Button>
            </DialogClose>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight text-foreground truncate">
                {callout.title}
              </DialogTitle>
              <DialogDescription id="callout-dialog-description" className="text-xs text-muted-foreground truncate">
                {callout.author?.name}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
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
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full px-6 md:px-10 pb-6">
            {/* Title + author */}
            <div className="py-8 space-y-5">
              <h1 className="text-3xl font-bold text-foreground leading-tight">{callout.title}</h1>

              {callout.author && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    {callout.author.avatarUrl && (
                      <AvatarImage src={callout.author.avatarUrl} alt={callout.author.name} />
                    )}
                    <AvatarFallback>{callout.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{callout.author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {callout.timestamp}
                      {callout.author.role && ` • ${callout.author.role}`}
                    </p>
                  </div>
                </div>
              )}

              {callout.description && (
                <p className="text-foreground/90 leading-relaxed text-sm">{callout.description}</p>
              )}

              {callout.imageUrl && (
                <img
                  src={callout.imageUrl}
                  alt={callout.title}
                  className="rounded-xl w-full max-h-[400px] object-cover shadow-sm"
                />
              )}
            </div>

            {/* Reactions + share bar */}
            <div className="flex items-center gap-4 py-4 border-y border-border">
              {callout.reactionCount !== undefined && callout.reactionCount > 0 && (
                <span className="text-sm text-muted-foreground font-medium">{callout.reactionCount} reactions</span>
              )}
              <div className="flex-1" />
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <span aria-hidden="true">😊</span>
                {t('calloutDialog.reactions')}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Share2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                {t('calloutDialog.share')}
              </Button>
            </div>

            {/* Contributions section */}
            {hasContributions && contributionsSlot && (
              <div className="py-8 border-b border-border">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-xl font-bold text-foreground">{t('calloutDialog.contributions')}</h2>
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
                <h2 className="text-xl font-bold text-foreground">{t('calloutDialog.discussion')}</h2>
                {callout.commentCount !== undefined && (
                  <Badge variant="secondary" className="rounded-full px-2">
                    {callout.commentCount}
                  </Badge>
                )}
              </div>
              {commentsSlot}
            </div>
          </div>
        </div>

        {/* Sticky footer — comment input */}
        {commentInputSlot && (
          <div className="shrink-0 p-4 bg-background border-t border-border z-20">
            <div className="max-w-4xl mx-auto">{commentInputSlot}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
