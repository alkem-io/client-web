import { EyeOff, ListChecks, MoreHorizontal, Plus, Tags, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Switch } from '@/crd/primitives/switch';
import { ClassificationValueSelector } from './ClassificationValueSelector';
import type { ClassificationEntryData } from './types';

export type ClassificationEntryCardProps = {
  entry: ClassificationEntryData;
  /** True for an entry added locally and not saved yet — shows an "Unsaved" badge. */
  unsaved?: boolean;
  /** Step B — full-replacement selection write (FR-012d). */
  onSelectValues: (entryId: string, selectedValueIDs: string[]) => void;
  /** The shown/hidden toggle (FR-010b/FR-010d) — worded "not shown on the Space page", never "private". */
  onToggleDisplay: (entryId: string, display: boolean) => void;
  /** Opens the removal confirmation (owned by the connector, FR-014b). */
  onRequestRemove: (entryId: string) => void;
  /** Words the shown/hidden copy for a subspace ("Subspace page") instead of a Space (FR-042). */
  subspace?: boolean;
  className?: string;
};

/**
 * One Classification on the Settings → About editor (product#2161 design 01):
 * icon tile + display label, a "Multi-select · N selected" meta line, every
 * value of the vocabulary as a chip (selected = filled with ×, unselected =
 * dashed with +), and a kebab menu holding the select-values toggle (the
 * checkbox/radio selector, kept as an alternative), the shown/hidden switch
 * and Remove.
 *
 * Every action is a callback — whether it commits at once or is staged until
 * the consumer saves is the consumer's call. An entry with no selection shows
 * only dashed chips — that is FR-012a's "empty/prompting group".
 */
export function ClassificationEntryCard({
  entry,
  unsaved,
  onSelectValues,
  onToggleDisplay,
  onRequestRemove,
  subspace,
  className,
}: ClassificationEntryCardProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const context = subspace ? 'subspace' : undefined;
  // Every value is always on screen as a chip, so the chip row itself is the
  // Step B prompt; the checkbox/radio selector stays available from the kebab.
  const [selectorOpen, setSelectorOpen] = useState(false);

  const selected = new Set(entry.selectedValueIDs);

  const deselect = (valueId: string) => {
    onSelectValues(
      entry.id,
      entry.selectedValueIDs.filter(id => id !== valueId)
    );
  };

  // Single-select replaces; multi-select accumulates in authored order (FR-002b, FR-012).
  const select = (valueId: string) => {
    onSelectValues(
      entry.id,
      entry.cardinality === 'SINGLE_SELECT'
        ? [valueId]
        : entry.values.filter(value => selected.has(value.id) || value.id === valueId).map(value => value.id)
    );
  };

  return (
    <div className={cn('rounded-lg border border-border p-4 space-y-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-500/15">
            <Tags aria-hidden="true" className="size-3.5 text-purple-600 dark:text-purple-400" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-body-emphasis text-foreground truncate">{entry.displayLabel}</h4>
              {unsaved && (
                <Badge variant="outline" className="shrink-0 border-primary/40 text-primary">
                  {t('classifications.entry.unsaved')}
                </Badge>
              )}
              {!entry.display && (
                <Badge variant="outline" className="gap-1 shrink-0">
                  <EyeOff className="size-3" aria-hidden="true" />
                  {t('classifications.display.hiddenHint', { context })}
                </Badge>
              )}
            </div>
            <p className="text-caption text-muted-foreground">
              {entry.cardinality === 'SINGLE_SELECT'
                ? t('classifications.entry.singleSelect')
                : t('classifications.entry.multiSelect')}
              {' · '}
              {t('classifications.entry.selectedCount', { count: entry.selectedValueIDs.length })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label={t('classifications.entry.actions', { label: entry.displayLabel })}
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectorOpen(open => !open)}>
              <ListChecks aria-hidden="true" className="size-4 mr-2" />
              {t('classifications.entry.selectValues')}
            </DropdownMenuItem>
            {/* The switch row toggles via the item's own click — worded per FR-010d, never "private". */}
            <DropdownMenuItem
              onSelect={event => {
                event.preventDefault();
                onToggleDisplay(entry.id, !entry.display);
              }}
            >
              <Switch checked={entry.display} className="mr-2 pointer-events-none" aria-hidden="true" />
              {t('classifications.display.toggleLabel', { context })}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onRequestRemove(entry.id)}
            >
              <Trash2 aria-hidden="true" className="size-4 mr-2" />
              {t('classifications.remove.menuLabel')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectorOpen && entry.values.length > 0 && (
        <ClassificationValueSelector
          entryId={entry.id}
          cardinality={entry.cardinality}
          values={entry.values}
          selectedValueIDs={entry.selectedValueIDs}
          onChange={selected => onSelectValues(entry.id, selected)}
          className="pt-1"
        />
      )}

      {/* Every value in authored order: selected = filled chip with ×, unselected = dashed chip with +. */}
      {entry.values.length > 0 && (
        // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
        // biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset
        <ul role="list" className={cn('flex flex-wrap gap-1.5', selectorOpen && 'mt-1 pt-3 border-t border-border')}>
          {entry.values.map(value => (
            <li key={value.id}>
              {selected.has(value.id) ? (
                <Badge
                  variant="secondary"
                  className="gap-1 border border-primary bg-primary py-0.5 pl-2 pr-1 text-caption font-medium text-primary-foreground shadow-sm"
                >
                  {value.label}
                  <button
                    type="button"
                    onClick={() => deselect(value.id)}
                    aria-label={t('classifications.entry.deselectValue', { label: value.label })}
                    className="rounded-sm p-0.5 text-primary-foreground/70 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </Badge>
              ) : (
                <button
                  type="button"
                  onClick={() => select(value.id)}
                  aria-label={t('classifications.entry.selectValue', { label: value.label })}
                  className="inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 px-2 py-0.5 text-caption text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus aria-hidden="true" className="size-3" />
                  {value.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Below the chips, so it disappears on the first pick without moving the chips under the cursor. */}
      {entry.selectedValueIDs.length === 0 && (
        <p className="text-caption text-muted-foreground">{t('classifications.valueSelector.noneSelected')}</p>
      )}
    </div>
  );
}
