import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/crd/primitives/skeleton';

/**
 * Loading placeholder shaped like the `PostCard` it stands in for: publisher row,
 * title + description lines, and the comments footer — so the feed doesn't jump
 * when the card lands (issue #10043).
 */
export function PostCardSkeleton() {
  const { t } = useTranslation('crd-space');
  return (
    <output
      className="flex flex-col gap-6 rounded-xl border border-border/60 bg-card"
      aria-label={t('a11y.loadingPost')}
    >
      {/* Publisher row — mirrors the CardHeader (avatar + name/timestamp, action cluster). */}
      <div className="flex items-start justify-between px-6 pt-5">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="size-8" />
      </div>

      {/* Body — title + three description lines. */}
      <div className="px-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Footer — the comments trigger row. */}
      <div className="border-t border-border bg-muted/5 px-6 py-3">
        <Skeleton className="h-4 w-28" />
      </div>
    </output>
  );
}
