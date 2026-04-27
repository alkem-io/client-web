import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LinkRow } from '@/crd/forms/callout/types';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';

type LinksPrePopulateRowsProps = {
  rows: LinkRow[];
  onChange: (rows: LinkRow[]) => void;
  /** Optional map keyed by `prePopulateLinkRows.<index>.title` for title-required errors. */
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
};

const createEmptyRow = (): LinkRow => ({ title: '', url: '', description: '' });

/**
 * "Pre-populate collection" editor shown inside the Links & Files response
 * panel on **create** mode. Hidden on edit (existing link contributions are
 * managed via the callout detail dialog — spec US12 acc. #6 / D19).
 */
export function LinksPrePopulateRows({ rows, onChange, errors, disabled }: LinksPrePopulateRowsProps) {
  const { t } = useTranslation('crd-space');

  const updateRow = (index: number, patch: Partial<LinkRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, createEmptyRow()]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-body-emphasis text-foreground">{t('contributionSettings.prePopulate.heading')}</Label>
      <p className="text-caption text-muted-foreground">{t('contributionSettings.prePopulate.description')}</p>

      {rows.length === 0 && (
        <p className="text-caption text-muted-foreground italic">{t('contributionSettings.prePopulate.empty')}</p>
      )}

      {rows.map((row, index) => {
        const titleError = errors?.[`prePopulateLinkRows.${index}.title`];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are append-and-delete; no stable id exists in the row model
          <div key={index} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={row.title}
                  onChange={e => updateRow(index, { title: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.titlePlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.titleLabel')}
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? `link-row-${index}-title-error` : undefined}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                {titleError && (
                  <p id={`link-row-${index}-title-error`} className="text-caption text-destructive" aria-live="polite">
                    {titleError}
                  </p>
                )}
                <input
                  type="url"
                  value={row.url}
                  onChange={e => updateRow(index, { url: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.urlPlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.urlLabel')}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                <input
                  type="text"
                  value={row.description}
                  onChange={e => updateRow(index, { description: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.descriptionPlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.descriptionLabel')}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(index)}
                disabled={disabled}
                aria-label={t('contributionSettings.prePopulate.removeRow')}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={disabled}>
        <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
        {t('contributionSettings.prePopulate.addRow')}
      </Button>
    </div>
  );
}
