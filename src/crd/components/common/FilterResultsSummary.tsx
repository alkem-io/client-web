import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type FilterResultsSummaryProps = {
  /** Active free-text search term, if any. */
  searchTerm?: string;
  /** Active tag filters, if any. */
  tags?: string[];
  /** Clears all active filters. */
  onClear: () => void;
  className?: string;
};

/**
 * A small line shown under filter controls summarising the active search term
 * and tag filters (e.g. `Results for "climate" and design, research`), with a
 * control to clear them. Renders nothing when no filter is active.
 */
export function FilterResultsSummary({ searchTerm, tags, onClear, className }: FilterResultsSummaryProps) {
  const { t } = useTranslation('crd-common');

  const trimmedTerm = searchTerm?.trim();
  const criteriaParts = [
    trimmedTerm ? `"${trimmedTerm}"` : undefined,
    tags && tags.length > 0 ? tags.join(', ') : undefined,
  ].filter((part): part is string => Boolean(part));

  if (criteriaParts.length === 0) return null;

  const criteria = criteriaParts.join(` ${t('filters.and')} `);

  return (
    <div className={cn('flex items-center gap-1.5 text-caption text-muted-foreground', className)}>
      <span>{t('filters.summary', { criteria })}</span>
      <button
        type="button"
        aria-label={t('filters.clear')}
        onClick={onClear}
        className="inline-flex items-center justify-center rounded p-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
