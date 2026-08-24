import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type NameListItem, SortableNameListEditor } from '@/crd/components/common/SortableNameListEditor';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';

/** Max column-name length — mirrors the server rule so the field flags it before the round-trip. */
const MAX_NAME_LENGTH = 128;

export type TaskColumnsDraftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current draft column names, left-to-right. The first is the protected default (tasks reflow into it). */
  columns: string[];
  /** Persist the edited draft (trimmed, empties dropped) back to the form. */
  onSave: (columns: string[]) => void;
};

/**
 * Create-time column editor for a Tasks board. Unlike `TaskBoardColumnsDialog`
 * (which drives live server mutations on an existing board), this edits a local
 * `string[]` draft synchronously — there is no callout yet — and hands the
 * result back on Save. Same validation (trim / non-empty / length / comma-free /
 * case-insensitive unique) and the same protected-first-column rule.
 */
export function TaskColumnsDraftDialog({ open, onOpenChange, columns, onSave }: TaskColumnsDraftDialogProps) {
  const { t } = useTranslation('crd-taskBoard');
  const [rows, setRows] = useState<{ id: string; name: string }[]>([]);
  const [nextRowId, setNextRowId] = useState(0);

  // Seed the draft only on the closed-to-open transition, against the form value
  // at that moment. Keying on `columns` too would reseed — and discard the
  // admin's in-progress edits — every time a parent re-render maps a fresh array.
  useEffect(() => {
    if (open) {
      setRows(columns.map((name, index) => ({ id: `col:${index}:${name}`, name })));
    }
  }, [open]);

  const validate = (row: { id: string; name: string }): string | undefined => {
    const trimmed = row.name.trim();
    if (trimmed.length === 0) return t('columns.validation.required');
    if (trimmed.length > MAX_NAME_LENGTH) return t('columns.validation.tooLong');
    if (trimmed.includes(',')) return t('columns.validation.comma');
    const clash = rows.some(other => other.id !== row.id && other.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (clash) return t('columns.validation.duplicate');
    return undefined;
  };

  const hasErrors = rows.some(row => validate(row) !== undefined);

  // Dirty when the trimmed, non-empty draft names diverge from the form value the
  // dialog was seeded with — an unedited empty new row is not a data loss.
  const isDirty =
    rows
      .map(row => row.name.trim())
      .filter(Boolean)
      .join(',') !== columns.join(',');

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => onOpenChange(false),
  });

  const items: NameListItem[] = rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    // The first column is the reflow target and can't be removed.
    deletable: index !== 0,
    deleteDisabledReason: t('columns.deleteFirstDisabled'),
  }));

  const handleSave = () => {
    if (hasErrors) return;
    onSave(rows.map(row => row.name.trim()).filter(Boolean));
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('columns.title')}</DialogTitle>
            <DialogDescription>{t('columns.description')}</DialogDescription>
          </DialogHeader>

          <SortableNameListEditor
            items={items}
            addLabel={t('columns.add')}
            dragLabel={t('columns.dragLabel')}
            deleteLabel={t('columns.deleteLabel')}
            nameLabel={t('columns.namePlaceholder')}
            namePlaceholder={t('columns.namePlaceholder')}
            errorFor={id => {
              const row = rows.find(r => r.id === id);
              return row ? validate(row) : undefined;
            }}
            onRename={(id, name) => setRows(prev => prev.map(row => (row.id === id ? { ...row, name } : row)))}
            onReorder={orderedIds =>
              setRows(prev =>
                orderedIds
                  .map(id => prev.find(row => row.id === id))
                  .filter((row): row is { id: string; name: string } => row !== undefined)
              )
            }
            onAdd={() => {
              const id = `new:${nextRowId}`;
              setNextRowId(prev => prev + 1);
              setRows(prev => [...prev, { id, name: '' }]);
            }}
            onDelete={id => setRows(prev => prev.filter(row => row.id !== id))}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={requestClose}>
              {t('columns.cancel')}
            </Button>
            <Button type="button" onClick={handleSave} disabled={hasErrors}>
              {t('columns.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
