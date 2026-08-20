import { EyeOff, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

export type ClassificationGroupListEntry = {
  id: string;
  displayLabel: string;
  /** Selected value labels, in authored order (resolveSelectedValues + a label projection). */
  values: string[];
  /** Render-only: not shown on the Space page (FR-010b/FR-010d) — editor-only badge, never "private". */
  hidden: boolean;
};

export type ClassificationGroupListProps = {
  /** Already filtered + ordered by the caller (see `groupEntriesForDisplay` in `./types`). */
  entries: ClassificationGroupListEntry[];
  /** True when the viewer holds the Space's edit rights — governs the hidden badge and edit affordance. */
  canEdit: boolean;
  /** Deep-links into Settings → About so the toggle/selection stays reachable (FR-018d). */
  onEditEntry?: (entryId: string) => void;
  className?: string;
};

/**
 * About-page grouped display (FR-018) — the only rendering surface this
 * iteration (D2). Each Classification renders as a labelled group: its
 * display label as a heading, selected values beneath, in `sortOrder`
 * (addition order, never alphabetical — FR-018b) — clearly separated from the
 * freeform Tags row by the consumer's layout.
 */
export function ClassificationGroupList({ entries, canEdit, onEditEntry, className }: ClassificationGroupListProps) {
  const { t } = useTranslation('crd-space');

  if (entries.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)} data-testid="classification-group-list">
      {entries.map(entry => (
        <div key={entry.id} className="space-y-1.5">
          <div className="flex items-center gap-2">
            {/* Body-weight label, not a card title — design 02 shows the group name as plain text above the chips. */}
            <h3 className="text-body-emphasis text-foreground">{entry.displayLabel}</h3>
            {entry.hidden && canEdit && (
              <Badge variant="outline" className="gap-1">
                <EyeOff className="size-3" aria-hidden="true" />
                {t('classifications.hiddenBadge')}
              </Badge>
            )}
            {canEdit && onEditEntry && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEditEntry(entry.id)}
                aria-label={t('classifications.editInSettings')}
                className="size-6"
              >
                <Pencil className="size-3" aria-hidden="true" />
              </Button>
            )}
          </div>

          {entry.values.length > 0 ? (
            // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
            // biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset
            <ul role="list" className="flex flex-wrap gap-1.5">
              {entry.values.map(value => (
                <li key={value}>
                  <Badge variant="secondary">{value}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            canEdit && <p className="text-caption text-muted-foreground">{t('classifications.emptyGroup')}</p>
          )}
        </div>
      ))}
    </div>
  );
}
