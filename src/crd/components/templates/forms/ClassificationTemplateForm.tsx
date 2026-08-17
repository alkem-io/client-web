import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClassificationCardinality } from '@/crd/components/classification/types';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import type { ClassificationTemplateFormProps, ClassificationTemplateValueRow } from '../types';

const MAX_VALUES = 50;

function moveRow(rows: ClassificationTemplateValueRow[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= rows.length) return rows;
  const next = [...rows];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * Classification Template form (US2 / FR-002). Value rows take a label ONLY
 * by default — the stable id field is an optional advanced override
 * (FR-002c): the UI MUST NOT require it to create a template. Order is
 * authored and preserved verbatim (FR-002b) — add/remove/reorder only, never
 * an alphabetical sort.
 */
export function ClassificationTemplateForm({ value, errors, onChange }: ClassificationTemplateFormProps) {
  const { t } = useTranslation('crd-templates');

  const setRows = (rows: ClassificationTemplateValueRow[]) => onChange({ ...value, values: rows });
  const setRow = (index: number, patch: Partial<ClassificationTemplateValueRow>) =>
    setRows(value.values.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const addRow = () => {
    if (value.values.length >= MAX_VALUES) return;
    setRows([...value.values, { label: '' }]);
  };
  const removeRow = (index: number) => setRows(value.values.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('form.classification.cardinality')}</Label>
        <RadioGroup
          value={value.cardinality}
          onValueChange={next => onChange({ ...value, cardinality: next as ClassificationCardinality })}
          className="gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="SINGLE_SELECT" id="classification-tpl-cardinality-single" />
            <Label htmlFor="classification-tpl-cardinality-single" className="font-normal cursor-pointer">
              {t('form.classification.cardinalitySingle')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="MULTI_SELECT" id="classification-tpl-cardinality-multi" />
            <Label htmlFor="classification-tpl-cardinality-multi" className="font-normal cursor-pointer">
              {t('form.classification.cardinalityMulti')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>{t('form.classification.values')}</Label>
        <div className="space-y-2">
          {value.values.map((row, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id until saved, and labels aren't unique
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  value={row.label}
                  onChange={e => setRow(index, { label: e.target.value })}
                  placeholder={t('form.classification.valueLabelPlaceholder')}
                  aria-label={t('form.classification.valueLabelPlaceholder')}
                  aria-invalid={Boolean(errors[`values.${index}.label`])}
                />
                <Input
                  value={row.id ?? ''}
                  onChange={e => setRow(index, { id: e.target.value || undefined })}
                  placeholder={t('form.classification.valueIdOverridePlaceholder')}
                  aria-label={t('form.classification.valueIdOverride')}
                  aria-invalid={Boolean(errors[`values.${index}.id`])}
                  className="text-caption"
                />
                {errors[`values.${index}.id`] && (
                  <p className="text-caption text-destructive">{errors[`values.${index}.id`]}</p>
                )}
              </div>
              <div className="flex flex-col gap-0.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => setRows(moveRow(value.values, index, -1))}
                  disabled={index === 0}
                  aria-label={`${t('form.classification.values')} ${index + 1} up`}
                >
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => setRows(moveRow(value.values, index, 1))}
                  disabled={index === value.values.length - 1}
                  aria-label={`${t('form.classification.values')} ${index + 1} down`}
                >
                  <ArrowDown className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 mt-1"
                onClick={() => removeRow(index)}
                aria-label={t('form.classification.removeValue')}
              >
                <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
        {errors.values && <p className="text-caption text-destructive">{errors.values}</p>}
        <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={value.values.length >= MAX_VALUES}>
          <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
          {t('form.classification.addValue')}
        </Button>
      </div>
    </div>
  );
}
