import { useTranslation } from 'react-i18next';
import type { TemplateType } from '@/crd/components/templates/types';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

const ALL_TYPES: TemplateType[] = ['space', 'callout', 'whiteboard', 'post', 'communityGuidelines'];

export type TemplateTypeFilterValue = TemplateType[] | 'all';

export type TemplateTypeFilterProps = {
  value: TemplateTypeFilterValue;
  onChange: (next: TemplateTypeFilterValue) => void;
  /** Optional per-type counts to render alongside each chip. */
  counts?: Partial<Record<TemplateType, number>>;
};

/**
 * Multi-select type filter for the Innovation Library gallery. Toggle chips
 * (one per template type) plus an "All" chip. Selecting nothing collapses back
 * to `'all'`. Responsive: chips wrap on narrow viewports (same component, no
 * separate mobile variant).
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

  return (
    <fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
      <legend className="sr-only">{t('library.filter.label')}</legend>
      <Button
        type="button"
        variant={isAll ? 'default' : 'outline'}
        size="sm"
        aria-pressed={isAll}
        onClick={() => onChange('all')}
      >
        {t('library.filter.all')}
      </Button>
      {ALL_TYPES.map(type => {
        const active = isActive(type);
        const count = counts?.[type];
        return (
          <Button
            key={type}
            type="button"
            variant={active ? 'default' : 'outline'}
            size="sm"
            aria-pressed={active}
            onClick={() => toggleType(type)}
          >
            {t(`library.filter.types.${type}`)}
            {count !== undefined && (
              <Badge variant="secondary" className="ml-2 text-badge">
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </fieldset>
  );
}
