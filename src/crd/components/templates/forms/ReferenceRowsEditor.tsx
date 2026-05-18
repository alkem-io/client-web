import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import type { ReferenceRow } from '../types';

export type ReferenceRowsEditorProps = {
  value: ReferenceRow[];
  onChange: (next: ReferenceRow[]) => void;
  /** Per-row error messages keyed by `${index}.name` / `${index}.uri` (any subset). */
  errors?: Record<string, string | undefined>;
  label?: string;
};

export function ReferenceRowsEditor({ value, onChange, errors, label }: ReferenceRowsEditorProps) {
  const { t } = useTranslation('crd-templates');

  const update = (index: number, patch: Partial<ReferenceRow>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const add = () => onChange([...value, { name: '', uri: '', description: '' }]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <ul className="space-y-3">
        {value.map((row, index) => (
          <li key={row.id ?? index} className="border rounded-md p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1.5">
                <Input
                  value={row.name}
                  onChange={e => update(index, { name: e.target.value })}
                  placeholder={t('references.name')}
                  aria-label={t('references.name')}
                  aria-invalid={Boolean(errors?.[`${index}.name`])}
                />
                {errors?.[`${index}.name`] && (
                  <p className="text-caption text-destructive">{errors[`${index}.name`]}</p>
                )}
                <Input
                  value={row.uri}
                  onChange={e => update(index, { uri: e.target.value })}
                  placeholder={t('references.uri')}
                  aria-label={t('references.uri')}
                  aria-invalid={Boolean(errors?.[`${index}.uri`])}
                />
                {errors?.[`${index}.uri`] && <p className="text-caption text-destructive">{errors[`${index}.uri`]}</p>}
                <Input
                  value={row.description ?? ''}
                  onChange={e => update(index, { description: e.target.value })}
                  placeholder={t('references.description')}
                  aria-label={t('references.description')}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive focus:text-destructive"
                aria-label={t('references.remove')}
                onClick={() => remove(index)}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" onClick={add}>
        <Plus aria-hidden="true" className="size-4 mr-2" />
        {t('references.add')}
      </Button>
    </div>
  );
}
