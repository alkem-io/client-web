import { Search, Tags } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { ClassificationTemplateOptionData } from './types';

export type ClassificationPickerSourceKey = 'platform' | 'space';

export type ClassificationPickerSource = {
  key: ClassificationPickerSourceKey;
  templates: ClassificationTemplateOptionData[];
  loading?: boolean;
};

/** A server-side display-label conflict (FR-011b) surfaced for the just-picked template. */
export type ClassificationPickerConflict = {
  templateId: string;
  /** The label that conflicted — used to seed the retry field with a suggested alternative. */
  attemptedLabel: string;
};

export type ClassificationPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Platform-wide and Space-scoped sources, in render order. */
  sources: ClassificationPickerSource[];
  /**
   * Picking a template fires this — the caller commits the add immediately
   * (FR-006a), with the template's own display label passed alongside its id
   * so a display-label conflict can be reported against the label that
   * actually collided, not an empty string.
   */
  onSelectTemplate: (templateId: string, displayLabel: string) => void;
  /**
   * A display-label conflict from the last attempted add (FR-011a/FR-011b) —
   * never "you already added this template", because no template identity is
   * tracked (FR-010/FR-011a).
   */
  conflict?: ClassificationPickerConflict | null;
  /** Retry the add for `conflict.templateId` with a different display label. */
  onRetryWithLabel: (templateId: string, displayLabel: string) => void;
  onDismissConflict: () => void;
  submitting?: boolean;
  className?: string;
};

/**
 * Step A picker (FR-007). Offers ONLY "select an existing Classification
 * Template" — never "create a template" and never an ad-hoc "create a
 * classification" option this iteration (C-5, FR-015, FR-016).
 */
export function ClassificationPickerDialog({
  open,
  onOpenChange,
  sources,
  onSelectTemplate,
  conflict,
  onRetryWithLabel,
  onDismissConflict,
  submitting,
  className,
}: ClassificationPickerDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [retryLabel, setRetryLabel] = useState(conflict?.attemptedLabel ?? '');
  const [search, setSearch] = useState('');

  // The dialog stays mounted across opens (`open` only toggles visibility), so the
  // `useState` initializer above only ever runs once. Without this effect a conflict
  // arriving after mount would leave the retry field blank instead of pre-seeded with
  // the label that collided.
  useEffect(() => {
    setRetryLabel(conflict?.attemptedLabel ?? '');
  }, [conflict?.templateId, conflict?.attemptedLabel]);

  const anyLoading = sources.some(s => s.loading);
  const isEmpty = !anyLoading && sources.every(s => s.templates.length === 0);

  // Search filters both groups by name/description (design 05); group counts
  // reflect the filtered list.
  const query = search.trim().toLowerCase();
  const filteredSources = sources.map(source => ({
    ...source,
    templates: query
      ? source.templates.filter(
          tpl => tpl.displayLabel.toLowerCase().includes(query) || tpl.description.toLowerCase().includes(query)
        )
      : source.templates,
  }));
  const noMatches = !anyLoading && !isEmpty && filteredSources.every(s => s.templates.length === 0);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onDismissConflict();
      setSearch('');
    }
    onOpenChange(next);
  };

  if (conflict) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={cn('sm:max-w-md', className)}>
          <DialogHeader>
            <DialogTitle>{t('classifications.picker.conflict.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-body text-muted-foreground">
            {t('classifications.picker.conflict.description', { label: conflict.attemptedLabel })}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="classification-conflict-label">{t('classifications.picker.conflict.fieldLabel')}</Label>
            <Input
              id="classification-conflict-label"
              value={retryLabel}
              onChange={e => setRetryLabel(e.target.value)}
              disabled={submitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onDismissConflict} disabled={submitting}>
              {t('classifications.picker.cancel')}
            </Button>
            <Button
              onClick={() => onRetryWithLabel(conflict.templateId, retryLabel)}
              disabled={submitting || !retryLabel.trim()}
              aria-busy={submitting}
            >
              {t('classifications.picker.conflict.retry')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn('sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden', className)}>
        <DialogHeader>
          <DialogTitle>{t('classifications.picker.title')}</DialogTitle>
        </DialogHeader>
        <p className="text-body text-muted-foreground">{t('classifications.picker.description')}</p>

        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('classifications.picker.searchPlaceholder')}
            aria-label={t('classifications.picker.searchPlaceholder')}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-4">
          {anyLoading && (
            <output aria-label={t('classifications.picker.title')} className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </output>
          )}

          {!anyLoading && isEmpty && (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <p className="text-body-emphasis text-foreground">{t('classifications.picker.emptyState.title')}</p>
              <p className="mt-1 text-caption text-muted-foreground">
                {t('classifications.picker.emptyState.description')}
              </p>
            </div>
          )}

          {noMatches && (
            <p className="text-body text-muted-foreground text-center py-4">
              {t('classifications.picker.noMatches', { query: search.trim() })}
            </p>
          )}

          {!anyLoading &&
            filteredSources.map(
              source =>
                source.templates.length > 0 && (
                  <div key={source.key}>
                    <h3 className="mb-2 text-label uppercase text-muted-foreground">
                      {source.key === 'platform'
                        ? t('classifications.picker.platformSection')
                        : t('classifications.picker.spaceSection')}{' '}
                      ({source.templates.length})
                    </h3>
                    {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
                    {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
                    <ul role="list" className="space-y-1">
                      {source.templates.map(template => (
                        <li key={template.id}>
                          <button
                            type="button"
                            onClick={() => onSelectTemplate(template.id, template.displayLabel)}
                            disabled={submitting}
                            className="w-full flex items-start gap-3 text-left rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                              <Tags aria-hidden="true" className="size-4 text-primary" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="text-body-emphasis text-foreground truncate">
                                  {template.displayLabel}
                                </span>
                                <Badge variant="secondary" className="shrink-0">
                                  {template.cardinality === 'SINGLE_SELECT'
                                    ? t('classifications.picker.singleSelect')
                                    : t('classifications.picker.multiSelect')}
                                </Badge>
                              </span>
                              {template.description && (
                                <span className="block mt-0.5 text-caption text-muted-foreground">
                                  {template.description}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            {t('classifications.picker.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
