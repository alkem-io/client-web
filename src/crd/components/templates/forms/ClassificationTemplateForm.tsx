import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClassificationCardinality } from '@/crd/components/classification/types';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
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
  const [draft, setDraft] = useState('');

  const setRows = (rows: ClassificationTemplateValueRow[]) => onChange({ ...value, values: rows });
  const setRow = (index: number, patch: Partial<ClassificationTemplateValueRow>) =>
    setRows(value.values.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const removeRow = (index: number) => setRows(value.values.filter((_, i) => i !== index));

  // Quick-add ("type a value and press Enter", design 04) — appends the trimmed
  // draft as a new row at the END of the authored order.
  const addDraft = () => {
    const label = draft.trim();
    if (!label || value.values.length >= MAX_VALUES) return;
    setRows([...value.values, { label }]);
    setDraft('');
  };

  // "N values defined" counts only rows that would survive submission (blank
  // labels are filtered out by the save path).
  const definedCount = value.values.filter(row => row.label.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label id="classification-tpl-cardinality-label">{t('form.classification.cardinality')}</Label>
        {/* Dropdown, not radios — product#2161 "Selection Type" (designs 04/09). */}
        <Select
          value={value.cardinality}
          onValueChange={next => onChange({ ...value, cardinality: next as ClassificationCardinality })}
        >
          <SelectTrigger aria-labelledby="classification-tpl-cardinality-label" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MULTI_SELECT">{t('form.classification.cardinalityMulti')}</SelectItem>
            <SelectItem value="SINGLE_SELECT">{t('form.classification.cardinalitySingle')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="classification-tpl-quick-add">{t('form.classification.values')}</Label>
        <p className="text-caption text-muted-foreground">{t('form.classification.valuesHint')}</p>
        {/* Quick-add: type a value and press Enter (design 04). Appends to the END —
            authored order is preserved, never sorted (FR-002b). */}
        <div className="flex items-center gap-2">
          <Input
            id="classification-tpl-quick-add"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDraft();
              }
            }}
            placeholder={t('form.classification.quickAddPlaceholder')}
            disabled={value.values.length >= MAX_VALUES}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addDraft}
            disabled={!draft.trim() || value.values.length >= MAX_VALUES}
            aria-label={t('form.classification.addValue')}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-caption text-muted-foreground" aria-live="polite">
          {t('form.classification.valuesDefined', { count: definedCount })}
        </p>
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
                  aria-label={t('form.classification.moveValueUp', { position: index + 1 })}
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
                  aria-label={t('form.classification.moveValueDown', { position: index + 1 })}
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
      </div>
    </div>
  );
}
