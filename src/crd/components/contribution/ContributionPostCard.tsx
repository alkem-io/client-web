import { MessageSquare } from 'lucide-react';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type ContributionPostCardProps = {
  title: string;
  author?: { name: string; avatarUrl?: string };
  createdDate?: string;
  description?: string;
  tags?: string[];
  commentCount?: number;
  onClick?: () => void;
  className?: string;
};

export function ContributionPostCard({
  title,
  author,
  createdDate,
  description,
  tags,
  commentCount,
  onClick,
  className,
}: ContributionPostCardProps) {
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
        'h-[180px] overflow-hidden flex flex-col',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <p className="text-body-emphasis text-foreground truncate">{title}</p>
      {author && (
        <div className="flex items-center gap-2 mt-1.5">
          <Avatar className="w-5 h-5">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
            <AvatarFallback className="text-badge">{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-caption text-muted-foreground">{author.name}</span>
          {createdDate && <span className="text-caption text-muted-foreground">• {createdDate}</span>}
        </div>
      )}
      {description && (
        <div className="mt-1.5 max-h-[3rem] overflow-hidden">
          <MarkdownContent content={description} className="text-caption text-muted-foreground line-clamp-2" />
        </div>
      )}
      <div className="flex items-center gap-1.5 mt-auto pt-2 min-w-0">
        {tags && tags.length > 0 && <CollapsibleTagList tags={tags} maxRows={1} className="flex-1 min-w-0" />}
        {commentCount !== undefined && commentCount > 0 && (
          <span className="flex items-center gap-1 text-caption text-muted-foreground ml-auto shrink-0">
            <MessageSquare className="w-3 h-3" aria-hidden="true" />
            {commentCount}
          </span>
        )}
      </div>
    </div>
  );
}
