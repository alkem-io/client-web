import { FileText, Presentation, StickyNote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type PostType = 'post' | 'whiteboard' | 'memo';

export type PostResultCardData = {
  id: string;
  title: string;
  snippet: string;
  type: PostType;
  bannerUrl?: string;
  author: { name: string; avatarUrl?: string };
  date: string;
  spaceName: string;
  href: string;
};

type PostResultCardProps = {
  post: PostResultCardData;
  onClick: () => void;
};

function PostTypeIcon({ type }: { type: PostType }) {
  switch (type) {
    case 'whiteboard':
      return <Presentation aria-hidden="true" className="size-3" />;
    case 'memo':
      return <StickyNote aria-hidden="true" className="size-3" />;
    default:
      return <FileText aria-hidden="true" className="size-3" />;
  }
}

export function PostResultCard({ post, onClick }: PostResultCardProps) {
  const { t } = useTranslation('crd-search');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={post.title}
      className={cn(
        'group block w-full text-left rounded-xl border bg-card overflow-hidden',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30',
        'transition-all duration-300 cursor-pointer'
      )}
    >
      {/* Banner */}
      <div className="overflow-hidden aspect-video">
        {post.bannerUrl ? (
          <img
            src={post.bannerUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-accent flex items-center justify-center">
            <PostTypeIcon type={post.type} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar className="size-[22px]">
            <AvatarImage src={post.author.avatarUrl} alt="" />
            <AvatarFallback className="text-badge bg-secondary text-secondary-foreground">
              {post.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-caption font-medium text-card-foreground truncate">{post.author.name}</span>
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-card-title text-card-foreground group-hover:text-primary transition-colors duration-200">
          {post.title}
        </h4>

        {/* Snippet */}
        <p className="line-clamp-2 text-caption text-muted-foreground flex-1">{post.snippet}</p>

        {/* Meta row */}
        <div className="border-t border-border pt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-badge bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
            <PostTypeIcon type={post.type} />
            {t(`search.postTypes.${post.type}`)}
          </span>
          <span className="text-badge text-muted-foreground">{post.date}</span>
        </div>

        {/* Space context */}
        <p className="text-[11px] text-muted-foreground truncate">
          {t('search.spaceContext', { spaceName: post.spaceName })}
        </p>
      </div>
    </button>
  );
}
