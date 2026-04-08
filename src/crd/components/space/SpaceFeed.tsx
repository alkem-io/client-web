import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { PostCardData } from './PostCard';
import { PostCard } from './PostCard';

type SpaceFeedProps = {
  title?: string;
  posts: PostCardData[];
  canCreate?: boolean;
  onCreateClick?: () => void;
  loading?: boolean;
  onShowMore?: () => void;
  hasMore?: boolean;
  onPostClick?: (id: string) => void;
  onPostSettingsClick?: (id: string) => void;
  onPostExpandClick?: (id: string) => void;
  className?: string;
};

export function SpaceFeed({
  title,
  posts,
  canCreate,
  onCreateClick,
  loading,
  onShowMore,
  hasMore,
  onPostClick,
  onPostSettingsClick,
  onPostExpandClick,
  className,
}: SpaceFeedProps) {
  const { t } = useTranslation('crd-space');

  return (
    <section className={cn('space-y-6', className)} aria-label={t('a11y.feedRegion')}>
      {/* Header */}
      {(title || canCreate) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {canCreate && (
            <Button size="sm" className="gap-2" onClick={onCreateClick}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('feed.addPost')}
            </Button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && posts.length === 0 && (
        <output className="block space-y-6" aria-label={t('feed.loading')}>
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border border-border p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </output>
      )}

      {/* Posts */}
      {posts.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground py-8 text-center">{t('feed.noCallouts')}</p>
      )}

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick?.(post.id)}
          onSettingsClick={onPostSettingsClick ? () => onPostSettingsClick(post.id) : undefined}
          onExpandClick={onPostExpandClick ? () => onPostExpandClick(post.id) : undefined}
        />
      ))}

      {/* Show More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onShowMore}>
            {t('feed.showMore')}
          </Button>
        </div>
      )}
    </section>
  );
}
