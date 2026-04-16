import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import type { PostCardData } from './PostCard';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from './PostCardSkeleton';

type SpaceFeedProps = {
  title?: string;
  /** Pre-mapped post data — used when posts are available upfront (e.g. demo app) */
  posts?: PostCardData[];
  /** Render slot — used for lazy-loaded callout items managed by the integration layer */
  children?: ReactNode;
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
  posts = [],
  children,
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

  const hasContent = Boolean(children) || posts.length > 0;

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

      {/* Loading state — only when no content at all */}
      {loading && !hasContent && (
        <output className="block space-y-6" aria-label={t('feed.loading')}>
          {[1, 2, 3].map(i => (
            <PostCardSkeleton key={i} />
          ))}
        </output>
      )}

      {/* Empty state */}
      {!hasContent && !loading && (
        <p className="text-sm text-muted-foreground py-8 text-center">{t('feed.noCallouts')}</p>
      )}

      {/* Content: children (lazy items) or posts (pre-mapped in the demo app) */}
      {children ??
        posts.map(post => (
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
