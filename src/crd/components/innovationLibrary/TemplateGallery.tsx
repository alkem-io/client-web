import { TemplateCard } from '@/crd/components/templates/TemplateCard';
import type { TemplateCardData } from '@/crd/components/templates/types';
import { Skeleton } from '@/crd/primitives/skeleton';

export type TemplateGalleryProps = {
  /** Already filtered by the active type filter (the consumer applies it). */
  templates: TemplateCardData[];
  loading?: boolean;
  onPreview: (templateId: string) => void;
  /** Empty state when no templates match (FR-053). */
  emptyLabel: string;
  /** Announced status label for the loading skeleton (assistive tech). */
  loadingLabel: string;
};

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'];

/**
 * Responsive grid of `TemplateCard`s for the Innovation Library. Read-only: the
 * kebab actions menu is hidden (`hideActions`) — the card body click previews.
 */
export function TemplateGallery({ templates, loading, onPreview, emptyLabel, loadingLabel }: TemplateGalleryProps) {
  if (loading) {
    return (
      <>
        {/* <output> carries an implicit role="status" so assistive tech announces the load. */}
        <output className="sr-only">{loadingLabel}</output>
        <ul
          aria-busy={true}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {SKELETON_KEYS.map(key => (
            <li key={key}>
              <Skeleton className="aspect-video w-full rounded-lg" />
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (templates.length === 0) {
    return <p className="py-12 text-center text-body text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {templates.map(template => (
        <li key={template.id}>
          <TemplateCard template={template} onPreview={onPreview} onAction={() => undefined} hideActions={true} />
        </li>
      ))}
    </ul>
  );
}
