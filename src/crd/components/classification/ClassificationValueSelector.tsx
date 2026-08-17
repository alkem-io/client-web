import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import type { ClassificationCardinality, ClassificationValueData } from './types';

export type ClassificationValueSelectorProps = {
  entryId: string;
  cardinality: ClassificationCardinality;
  /** The snapshot vocabulary, in authored order — never re-sorted (FR-002b). */
  values: ClassificationValueData[];
  selectedValueIDs: string[];
  /**
   * Emits the COMPLETE selected-id list on every change (FR-012d — full
   * replacement, not a per-value delta). Single-select: picking a value
   * replaces any prior selection; multi-select: values accumulate.
   */
  onChange: (selectedValueIDs: string[]) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Step B — the value selector over an added Classification's snapshot value
 * set. Renders `values` in their authored order and never re-sorts them.
 */
export function ClassificationValueSelector({
  entryId,
  cardinality,
  values,
  selectedValueIDs,
  onChange,
  disabled,
  className,
}: ClassificationValueSelectorProps) {
  const { t } = useTranslation('crd-spaceSettings');

  if (cardinality === 'SINGLE_SELECT') {
    return (
      <RadioGroup
        value={selectedValueIDs[0] ?? ''}
        onValueChange={next => onChange(next ? [next] : [])}
        disabled={disabled}
        className={cn('gap-2', className)}
        aria-label={t('classifications.valueSelector.noneSelected')}
      >
        {values.map(value => {
          const inputId = `classification-${entryId}-value-${value.id}`;
          return (
            <div key={value.id} className="flex items-center gap-2">
              <RadioGroupItem value={value.id} id={inputId} />
              <Label htmlFor={inputId} className="font-normal cursor-pointer">
                {value.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    );
  }

  const selected = new Set(selectedValueIDs);
  const toggle = (valueId: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(valueId);
    else next.delete(valueId);
    // Preserve authored order in the emitted list, not toggle order.
    onChange(values.filter(v => next.has(v.id)).map(v => v.id));
  };

  return (
    <fieldset className={cn('flex flex-col gap-2 border-0 p-0 m-0', className)}>
      <legend className="sr-only">{t('classifications.valueSelector.noneSelected')}</legend>
      {values.map(value => {
        const inputId = `classification-${entryId}-value-${value.id}`;
        return (
          <div key={value.id} className="flex items-center gap-2">
            <Checkbox
              id={inputId}
              checked={selected.has(value.id)}
              onCheckedChange={checked => toggle(value.id, checked === true)}
              disabled={disabled}
            />
            <Label htmlFor={inputId} className="font-normal cursor-pointer">
              {value.label}
            </Label>
          </div>
        );
      })}
    </fieldset>
  );
}
