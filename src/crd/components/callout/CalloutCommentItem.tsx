import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type CalloutCommentItemProps = {
  author: { name: string; avatarUrl?: string };
  content: string;
  timestamp: string;
  isReply?: boolean;
  className?: string;
};

export function CalloutCommentItem({ author, content, timestamp, isReply, className }: CalloutCommentItemProps) {
  return (
    <div className={cn('flex gap-3', isReply && 'ml-10', className)}>
      <Avatar className="w-8 h-8 shrink-0">
        {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
        <AvatarFallback className="text-xs">{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{author.name}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
