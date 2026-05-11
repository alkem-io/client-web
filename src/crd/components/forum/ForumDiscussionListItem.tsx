import type { ForumDiscussionListItemData } from '@/crd/components/forum/forumTypes';
import { cn } from '@/crd/lib/utils';

type ForumDiscussionListItemProps = {
  data: ForumDiscussionListItemData;
  metaLine: string;
  isLast?: boolean;
  onActivate?: (id: string) => void;
};

export function ForumDiscussionListItem({ data, metaLine, isLast, onActivate }: ForumDiscussionListItemProps) {
  const handleClick = onActivate
    ? (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onActivate(data.id);
      }
    : undefined;

  return (
    <li>
      <a
        href={data.href}
        onClick={handleClick}
        aria-label={data.ariaLabel}
        className={cn(
          'flex w-full cursor-pointer items-start gap-3 px-5 py-3.5 text-left transition-colors',
          'hover:bg-accent/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          !isLast && 'border-b border-border'
        )}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground"
        >
          {data.iconNode}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block leading-tight text-card-title text-foreground line-clamp-1">{data.title}</span>
          <span className="mt-0.5 block text-caption text-muted-foreground">{metaLine}</span>
        </div>
      </a>
    </li>
  );
}
