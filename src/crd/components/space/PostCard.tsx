import { FileText, LayoutGrid, Maximize2, MessageSquare, MoreHorizontal, Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/crd/primitives/card';

export type PostType = 'text' | 'whiteboard' | 'collection' | 'call-for-whiteboards';

const MAX_COLLECTION_PREVIEW_ITEMS = 4;
const MAX_WHITEBOARD_PREVIEW_ITEMS = 4;
const MAX_VISIBLE_WHITEBOARDS_BEFORE_MORE = 3;

export type PostCardData = {
  id: string;
  type: PostType;
  author?: {
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  title: string;
  snippet?: string;
  timestamp?: string;
  isDraft?: boolean;
  contentPreview?: {
    imageUrl?: string;
    items?: Array<{ title: string; type: string }>;
    whiteboards?: Array<{ title: string; imageUrl: string; author: string }>;
  };
  commentCount?: number;
};

type PostCardProps = {
  post: PostCardData;
  onClick?: () => void;
  onSettingsClick?: () => void;
  onExpandClick?: () => void;
  className?: string;
};

const typeIcons: Record<PostType, typeof FileText> = {
  text: FileText,
  whiteboard: LayoutGrid,
  collection: LayoutGrid,
  'call-for-whiteboards': Presentation,
};

const typeLabels = {
  text: 'callout.post',
  whiteboard: 'callout.whiteboard',
  collection: 'callout.collection',
  'call-for-whiteboards': 'callout.callForWhiteboards',
} as const;

export function PostCard({ post, onClick, onSettingsClick, onExpandClick, className }: PostCardProps) {
  const { t } = useTranslation('crd-space');
  const TypeIcon = typeIcons[post.type];

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-6 space-y-0">
        <div className="flex gap-3">
          {post.author && (
            <Avatar className="w-10 h-10 border border-border">
              {post.author.avatarUrl && <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />}
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2">
              {post.author && <span className="font-semibold text-sm text-foreground">{post.author.name}</span>}
              {post.timestamp && <span className="text-xs text-muted-foreground">• {post.timestamp}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {post.author?.role && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                  {post.author.role}
                </Badge>
              )}
              {post.isDraft && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-amber-600 border-amber-300">
                  {t('callout.draft')}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TypeIcon className="w-4 h-4" aria-hidden="true" />
                {t(typeLabels[post.type])}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onExpandClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={e => {
                e.stopPropagation();
                onExpandClick();
              }}
              aria-label={t('callout.expand')}
            >
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={e => {
                e.stopPropagation();
                onSettingsClick();
              }}
              aria-label={t('mobile.settings')}
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-3">
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
          <button type="button" className="text-left cursor-pointer hover:underline" onClick={onClick}>
            {post.title}
          </button>
        </h3>
        {post.snippet && <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{post.snippet}</p>}

        {/* Whiteboard preview */}
        {post.type === 'whiteboard' && post.contentPreview?.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video">
            <img
              src={post.contentPreview.imageUrl}
              alt={t('callout.whiteboard')}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Button variant="secondary" className="shadow-sm" onClick={onClick}>
                {t('callout.openWhiteboard')}
              </Button>
            </div>
          </div>
        )}

        {/* Collection preview */}
        {post.type === 'collection' && post.contentPreview?.items && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {post.contentPreview.items.slice(0, MAX_COLLECTION_PREVIEW_ITEMS).map(item => (
              <div key={item.title} className="bg-muted/30 rounded-md p-3 border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-background rounded flex items-center justify-center border border-border shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <span className="text-xs font-medium truncate">{item.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Call-for-whiteboards preview */}
        {post.type === 'call-for-whiteboards' && post.contentPreview?.whiteboards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {post.contentPreview.whiteboards.slice(0, MAX_WHITEBOARD_PREVIEW_ITEMS).map((wb, idx) => {
              const total = post.contentPreview?.whiteboards?.length ?? 0;
              const remaining = total - MAX_VISIBLE_WHITEBOARDS_BEFORE_MORE;
              const isLast = idx === MAX_VISIBLE_WHITEBOARDS_BEFORE_MORE;
              const showMore = isLast && remaining > 0;

              return (
                <div
                  key={wb.title}
                  className="group/wb relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-[4/3] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  <img
                    src={wb.imageUrl}
                    alt={wb.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/wb:scale-105"
                  />
                  {!showMore && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-3 flex flex-col justify-end pointer-events-none">
                      <p className="text-white text-xs font-semibold truncate">{wb.title}</p>
                      <p className="text-white/70 text-[10px] truncate">{wb.author}</p>
                    </div>
                  )}
                  {showMore && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
                      <span className="text-white font-bold text-lg">
                        {t('callout.moreWhiteboards', { count: remaining })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-3 border-t bg-muted/5 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs">
            {post.commentCount ? t('callout.comments', { count: post.commentCount }) : t('callout.commentsZero')}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
