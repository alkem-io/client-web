import { Check, ChevronDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TemplateType } from '@/crd/components/templates/types';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

const ALL_TYPES: TemplateType[] = ['space', 'callout', 'whiteboard', 'post', 'communityGuidelines'];

export type TemplateTypeFilterValue = TemplateType[] | 'all';

export type TemplateTypeFilterProps = {
  value: TemplateTypeFilterValue;
  onChange: (next: TemplateTypeFilterValue) => void;
  /** Optional per-type counts to render alongside each option. */
  counts?: Partial<Record<TemplateType, number>>;
};

/**
 * Multi-select type filter for the Innovation Library gallery, rendered as a
 * combobox: a Filter-icon trigger whose label reads "All" by default, or the
 * first selected type + "and N more" once specific types are picked. The menu
 * lists "All" plus one checkbox row per type, each with a left check mark.
 * While "All" is active every type row shows a muted (greyed) check — they are
 * all implicitly included; clicking a type switches to an explicit selection.
 * Deselecting everything collapses back to `'all'`.
 */
export function TemplateTypeFilter({ value, onChange, counts }: TemplateTypeFilterProps) {
  const { t } = useTranslation('crd-templates');
  const isAll = value === 'all';
  const isActive = (type: TemplateType) => !isAll && value.includes(type);

  const toggleType = (type: TemplateType) => {
    if (isAll) {
      onChange([type]);
      return;
    }
    const next = value.includes(type) ? value.filter(x => x !== type) : [...value, type];
    onChange(next.length === 0 ? 'all' : next);
  };

  // Selected types follow the canonical order so the label is deterministic.
  const selectedInOrder = ALL_TYPES.filter(type => isActive(type));
  const labelFor = (type: TemplateType) => t(`library.filter.types.${type}`);
  const triggerLabel =
    isAll || selectedInOrder.length === 0
      ? t('library.filter.all')
      : selectedInOrder.length === 1
        ? labelFor(selectedInOrder[0])
        : selectedInOrder.length === 2
          ? t('library.filter.pair', { first: labelFor(selectedInOrder[0]), second: labelFor(selectedInOrder[1]) })
          : t('library.filter.summary', { first: labelFor(selectedInOrder[0]), count: selectedInOrder.length - 1 });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button type="button" variant="outline" size="sm" className="min-w-[12rem] justify-between">
          <span className="flex min-w-0 items-center gap-2">
            <Filter aria-hidden={true} className={cn('size-4 shrink-0', !isAll && 'fill-primary text-primary')} />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <ChevronDown aria-hidden={true} className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuItem
          role="menuitemcheckbox"
          aria-checked={isAll}
          className="pl-8"
          onSelect={event => {
            event.preventDefault();
            onChange('all');
          }}
        >
          <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            {isAll && <Check aria-hidden={true} className="size-4" />}
          </span>
          {t('library.filter.all')}
        </DropdownMenuItem>
        {ALL_TYPES.map(type => {
          const active = isActive(type);
          const count = counts?.[type];
          return (
            <DropdownMenuItem
              key={type}
              role="menuitemcheckbox"
              aria-checked={active}
              className="pl-8"
              onSelect={event => {
                event.preventDefault();
                toggleType(type);
              }}
            >
              <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                {(active || isAll) && (
                  <Check aria-hidden={true} className={cn('size-4', isAll && 'text-muted-foreground opacity-50')} />
                )}
              </span>
              <span className="flex-1 truncate">{t(`library.filter.types.${type}`)}</span>
              {count !== undefined && <span className="ml-2 text-caption text-muted-foreground">{count}</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
