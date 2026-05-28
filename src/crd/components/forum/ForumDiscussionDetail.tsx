import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ShareButton } from '@/crd/components/common/ShareButton';
import type { ForumDiscussionDetailData } from '@/crd/components/forum/forumTypes';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
import { Separator } from '@/crd/primitives/separator';

type ForumDiscussionDetailProps = {
  data: ForumDiscussionDetailData;
  backHref: string;
  backLabel: string;
  commentsSlot: ReactNode;
  shareLabel: string;
  editLabel: string;
  deleteLabel: string;
  shareSlot?: ReactNode;
  className?: string;
  /** Optional click interceptor for the back link. When provided, the `<a href={backHref}>`
   *  navigation is suppressed via `event.preventDefault()` and the callback is invoked instead —
   *  consumers wire React Router's `navigate(backHref)` here to avoid a full page reload. */
  onBack?: () => void;
};

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

export function ForumDiscussionDetail({
  data,
  backHref,
  backLabel,
  commentsSlot,
  shareLabel,
  editLabel,
  deleteLabel,
  shareSlot,
  className,
  onBack,
}: ForumDiscussionDetailProps) {
  const handleBackClick = onBack
    ? (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        onBack();
      }
    : undefined;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <a
        href={backHref}
        onClick={handleBackClick}
        className={cn(
          'inline-flex w-fit cursor-pointer items-center gap-1.5 text-body-emphasis text-muted-foreground transition-colors',
          'hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        <span>{backLabel}</span>
      </a>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="px-6 pb-0 pt-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="flex items-center gap-2 text-section-title text-foreground">
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
              >
                {data.iconNode}
              </span>
              <span>{data.title}</span>
            </h2>
            {shareSlot ?? <ShareButton url={data.shareUrl} tooltip={shareLabel} dialogTitle={shareLabel} />}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          <div className="mb-5 flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              {data.author.avatarUrl ? <AvatarImage src={data.author.avatarUrl} alt={data.author.displayName} /> : null}
              <AvatarFallback color={data.author.avatarColor}>{initialOf(data.author.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="block text-card-title text-foreground">{data.author.displayName}</span>
              <span className="block text-caption text-muted-foreground">{data.formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              {data.onEdit ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={editLabel}
                  onClick={data.onEdit}
                  className="size-8 text-muted-foreground"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </Button>
              ) : null}
              {data.onDelete ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={deleteLabel}
                  onClick={data.onDelete}
                  className="size-8 text-muted-foreground"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mb-6">{data.body.contentNode}</div>

          <Separator />

          <div className="mt-5">{commentsSlot}</div>
        </CardContent>
      </Card>
    </div>
  );
}
