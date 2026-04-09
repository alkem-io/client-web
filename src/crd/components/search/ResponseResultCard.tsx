import { FileText, MessageSquare, Presentation, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PostType } from '@/crd/components/search/PostResultCard';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type ResponseResultCardData = {
  id: string;
  title: string;
  snippet: string;
  type: PostType;
  author: { name: string; avatarUrl?: string };
  date: string;
  parentPostTitle: string;
  spaceName: string;
  href: string;
};

type ResponseResultCardProps = {
  response: ResponseResultCardData;
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

export function ResponseResultCard({ response, onClick }: ResponseResultCardProps) {
  const { t } = useTranslation('crd-search');
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={response.title}
      className={cn(
        'group block w-full text-left rounded-xl border bg-card overflow-hidden',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-all duration-300 cursor-pointer'
      )}
      style={{
        boxShadow: hovered ? 'var(--elevation-sm)' : 'none',
        borderColor: hovered ? 'color-mix(in srgb, var(--primary) 30%, var(--border))' : undefined,
      }}
    >
      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={response.author.avatarUrl} alt="" />
            <AvatarFallback className="text-[9px] font-semibold bg-secondary text-secondary-foreground">
              {response.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[12px] font-medium text-card-foreground truncate">{response.author.name}</span>
          <span className="text-[10px] ml-auto text-muted-foreground">{response.date}</span>
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
          {response.title}
        </h4>

        {/* Snippet */}
        <p className="line-clamp-2 text-[12px] text-muted-foreground flex-1">{response.snippet}</p>

        {/* Parent context */}
        <div className="border-t border-border pt-2 flex items-center gap-1.5">
          <MessageSquare aria-hidden="true" className="size-[11px] text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">
            {t('search.responseTo', { title: response.parentPostTitle })}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
            <PostTypeIcon type={response.type} />
            {t(`search.postTypes.${response.type}`)}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {t('search.spaceContext', { spaceName: response.spaceName })}
          </span>
        </div>
      </div>
    </button>
  );
}
