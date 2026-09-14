import { EyeOff, ListChecks, MoreHorizontal, Tags, Trash2, X } from 'lucide-react';
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
import { resolveSelectedValues } from './types';

export type ClassificationEntryCardProps = {
  entry: ClassificationEntryData;
  /** True while this entry's selection write is in flight — the selector renders disabled. */
  selectionPending?: boolean;
  /** Step B — full-replacement selection write (FR-012d). */
  onSelectValues: (entryId: string, selectedValueIDs: string[]) => void;
  /** The shown/hidden toggle (FR-010b/FR-010d) — worded "not shown on the Space page", never "private". */
  onToggleDisplay: (entryId: string, display: boolean) => void;
  /** Opens the removal confirmation (owned by the connector, FR-014b). */
  onRequestRemove: (entryId: string) => void;
  className?: string;
};

/**
 * One Classification on the Settings → About editor (product#2161 design 01):
 * icon tile + display label, a "Multi-select · N selected" meta line, the
 * selected values as chips with per-chip deselect, and a kebab menu holding
 * the select-values toggle, the shown/hidden switch and Remove.
 *
 * Each action commits immediately (FR-006a) — nothing here is buffered.
 * The value selector expands inline; it starts open while the entry still
 * has no selection (FR-012a's "empty/prompting group").
 */
export function ClassificationEntryCard({
  entry,
  selectionPending,
  onSelectValues,
  onToggleDisplay,
  onRequestRemove,
  className,
}: ClassificationEntryCardProps) {
  const { t } = useTranslation('crd-spaceSettings');
  // Step B invitation: an entry added moments ago (Step A) has nothing selected
  // yet — open the selector so the two-step flow reads as one motion.
  const [selectorOpen, setSelectorOpen] = useState(entry.selectedValueIDs.length === 0);

  const selectedValues = resolveSelectedValues(entry);

  const deselect = (valueId: string) => {
    onSelectValues(
      entry.id,
      entry.selectedValueIDs.filter(id => id !== valueId)
    );
  };

  return (
    <div className={cn('rounded-lg border border-border p-4 space-y-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Tags aria-hidden="true" className="size-4 text-primary" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-body-emphasis text-foreground truncate">{entry.displayLabel}</h4>
              {!entry.display && (
                <Badge variant="outline" className="gap-1 shrink-0">
                  <EyeOff className="size-3" aria-hidden="true" />
                  {t('classifications.display.hiddenHint')}
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
              {t('classifications.display.toggleLabel')}
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
          disabled={selectionPending}
          className="pt-1"
        />
      )}

      {/* Chips render BELOW the selector while it is open: ticking a value must
          never move the checkbox list under the user's cursor (layout shift),
          but the live selection stays visible. Collapse via kebab → "Select values…". */}
      {selectedValues.length > 0 ? (
        // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
        // biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset
        <ul role="list" className={cn('flex flex-wrap gap-1.5', selectorOpen && 'mt-1 pt-3 border-t border-border')}>
          {selectedValues.map(value => (
            <li key={value.id}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {value.label}
                <button
                  type="button"
                  onClick={() => deselect(value.id)}
                  disabled={selectionPending}
                  aria-label={t('classifications.entry.deselectValue', { label: value.label })}
                  className="rounded-sm p-0.5 hover:bg-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        !selectorOpen && (
          <p className="text-caption text-muted-foreground">{t('classifications.valueSelector.noneSelected')}</p>
        )
      )}
    </div>
  );
}
