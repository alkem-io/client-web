import { ExternalLink, Pencil, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

export type CalloutPostPreviewReference = {
  id: string;
  name: string;
  uri: string;
  description?: string;
};

export type CalloutPostPreviewData = {
  id: string;
  title: string;
  author?: { name: string; avatarUrl?: string; profileUrl?: string };
  timestamp?: string;
  description?: string;
  tags?: string[];
  references?: CalloutPostPreviewReference[];
};

type CalloutPostPreviewProps = {
  post: CalloutPostPreviewData;
  loading?: boolean;
  /** Render the edit button when the consumer wires `onEdit`. */
  onEdit?: () => void;
  /** Mount point for the share trigger (e.g. the CRD `ShareButton`) so the
   *  consumer keeps full control over the share-dialog state. */
  shareSlot?: ReactNode;
  /** Closing the preview returns to the contributions grid in the parent. */
  onClose?: () => void;
  className?: string;
};

/**
 * Inline read-only preview of a selected post contribution rendered inside the
 * callout detail dialog. Mirrors the MUI `CalloutContributionPreview` +
 * `CalloutContributionPreviewPost` pair: a card-like header with the post
 * title, author, timestamp, and an action cluster (edit / share / close), and
 * a body with the description, tags, and references.
 */
export function CalloutPostPreview({ post, loading, onEdit, shareSlot, onClose, className }: CalloutPostPreviewProps) {
  const { t } = useTranslation('crd-space');

  const hasTags = (post.tags?.length ?? 0) > 0;
  const hasReferences = (post.references?.length ?? 0) > 0;

  return (
    <section
      className={cn('rounded-lg border border-primary/40 bg-card overflow-hidden', className)}
      aria-label={t('postPreview.label')}
    >
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3 min-w-0">
          {post.author &&
            (post.author.profileUrl ? (
              <a
                href={post.author.profileUrl}
                onClick={e => e.stopPropagation()}
                aria-label={post.author.name}
                className="relative z-10 block shrink-0 rounded-full -m-0.5 p-0.5 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="w-9 h-9 border border-border">
                  {post.author.avatarUrl && <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />}
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </a>
            ) : (
              <Avatar className="w-9 h-9 border border-border shrink-0">
                {post.author.avatarUrl && <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />}
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          <div className="min-w-0">
            <h3 className="text-card-title text-foreground truncate">
              {loading ? <Skeleton className="h-4 w-40" /> : post.title}
            </h3>
            {(post.author || post.timestamp) && (
              <p className="text-caption text-muted-foreground truncate">
                {post.author?.profileUrl ? (
                  <a
                    href={post.author.profileUrl}
                    onClick={e => e.stopPropagation()}
                    className="relative z-10 rounded-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {post.author.name}
                  </a>
                ) : (
                  post.author?.name
                )}
                {post.author && post.timestamp && ' • '}
                {post.timestamp}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={t('postPreview.edit')}
              onClick={onEdit}
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          {shareSlot}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={t('postPreview.close')}
              onClick={onClose}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 bg-background">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : post.description ? (
          <MarkdownContent content={post.description} className="text-foreground/90" />
        ) : (
          <p className="text-body text-muted-foreground italic">{t('postPreview.emptyDescription')}</p>
        )}

        {(hasTags || hasReferences) && <hr className="border-border" />}

        {hasTags && <CollapsibleTagList tags={post.tags ?? []} />}

        {hasReferences && (
          <div>
            <p className="text-label uppercase text-muted-foreground mb-2">{t('postPreview.references')}</p>
            <ul className="space-y-1.5">
              {post.references?.map(ref => (
                <li key={ref.id}>
                  <a
                    href={ref.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-body-emphasis text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {ref.name}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  {ref.description && <p className="text-caption text-muted-foreground ml-0.5">{ref.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
