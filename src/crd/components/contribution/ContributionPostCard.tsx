import { MessageSquare } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

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
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-foreground truncate">{title}</p>
      {author && (
        <div className="flex items-center gap-2 mt-1.5">
          <Avatar className="w-5 h-5">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
            <AvatarFallback className="text-[8px]">{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{author.name}</span>
          {createdDate && <span className="text-xs text-muted-foreground">• {createdDate}</span>}
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{description}</p>}
      <div className="flex items-center gap-2 mt-2">
        {tags?.slice(0, 3).map(tag => (
          <Badge key={tag} variant="secondary" className="text-[9px] px-1 h-4">
            {tag}
          </Badge>
        ))}
        {commentCount !== undefined && commentCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <MessageSquare className="w-3 h-3" aria-hidden="true" />
            {commentCount}
          </span>
        )}
      </div>
    </button>
  );
}
