import { MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Skeleton } from '@/crd/primitives/skeleton';

export type TaskCardProps = {
  title: string;
  author?: { name: string; avatarUrl?: string };
  description?: string;
  tags?: string[];
  commentCount?: number;
  /** Decorative drag affordance rendered on the card's left edge (shown only when the board is draggable). */
  dragHandleSlot?: ReactNode;
  onClick?: () => void;
  className?: string;
};

/**
 * A single task on the board. Composes the same post-card pieces used elsewhere
 * but clamps the title to two lines so a card stays compact inside a narrow
 * column. Presentational only — all behavior arrives through props.
 */
export function TaskCard({
  title,
  author,
  description,
  tags,
  commentCount,
  dragHandleSlot,
  onClick,
  className,
}: TaskCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a <button> here would nest interactive descendants (CollapsibleTagList renders a "+N" <button>; MarkdownContent can render <a> links) which is invalid HTML
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'w-full text-left p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'flex flex-col',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex gap-1.5 min-w-0">
        {dragHandleSlot && <span className="-ml-1 mt-0.5 shrink-0 text-muted-foreground">{dragHandleSlot}</span>}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-card-title text-foreground line-clamp-2">{title}</p>
          {description && (
            <div className="mt-2 max-h-[3.4rem] overflow-hidden">
              <MarkdownContent content={description} className="text-body text-muted-foreground line-clamp-2" />
            </div>
          )}
          {tags && tags.length > 0 && <CollapsibleTagList tags={tags} maxRows={1} className="mt-2 min-w-0" />}
          {(author || (commentCount !== undefined && commentCount > 0)) && (
            <div className="mt-3 flex items-center gap-1.5 min-w-0">
              {author && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="w-5 h-5">
                    {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
                    <AvatarFallback className="text-badge">{author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-caption text-muted-foreground truncate">{author.name}</span>
                </div>
              )}
              {commentCount !== undefined && commentCount > 0 && (
                <span className="ml-auto flex shrink-0 items-center gap-1 text-caption text-muted-foreground">
                  <MessageSquare className="w-3 h-3" aria-hidden="true" />
                  {commentCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Placeholder shown in a column body while board data loads. */
export function TaskCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-3 border border-border rounded-lg bg-card flex flex-col gap-2', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
