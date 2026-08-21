import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type NameListItem, SortableNameListEditor } from '@/crd/components/common/SortableNameListEditor';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
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

export type TaskBoardColumnModel = {
  /** Stable key for the row — the column's current server name. */
  name: string;
};

export type TaskBoardColumnsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Columns in left-to-right order; the first is the protected default. */
  columns: TaskBoardColumnModel[];
  /**
   * Create a new column with this name (fired on Save for each newly added
   * row). The returned promise MUST reject if the server rejects, so the save
   * sweep aborts before issuing the reorder and keeps the dialog open.
   */
  onAddColumn: (name: string) => Promise<void>;
  /** Rename a column (current → next), one call per changed row on Save. Rejects on server failure. */
  onRenameColumn: (currentName: string, nextName: string) => Promise<void>;
  /** Persist a new left-to-right order (full name list). Rejects on server failure. */
  onReorderColumns: (orderedNames: string[]) => Promise<void>;
  /** Delete a column by name (only after the confirm dialog). */
  onDeleteColumn: (name: string) => void;
};

/**
 * Column-management surface for a Tasks board. Presentational: it owns only the
 * local draft (names + order) and the transient delete-confirmation, and calls
 * a prop per column mutation. Client-side validation (trim / non-empty / length
 * / comma-free / case-insensitive unique) gives instant feedback while the
 * server stays authoritative. Deleting the first (default) column is disabled —
 * tasks reflow into it.
 */
export function TaskBoardColumnsDialog({
  open,
  onOpenChange,
  columns,
  onAddColumn,
  onRenameColumn,
  onReorderColumns,
  onDeleteColumn,
}: TaskBoardColumnsDialogProps) {
  const { t } = useTranslation('crd-taskBoard');
  // Draft rows carry a stable local id plus the edited name. Existing columns
  // seed `originalName` (their server name) so Save can tell renames from new
  // rows and reorder against the origin; freshly added rows have no
  // `originalName` and become creates on Save.
  const [rows, setRows] = useState<{ id: string; name: string; originalName?: string }[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | undefined>();
  const [nextRowId, setNextRowId] = useState(0);
  const [saving, setSaving] = useState(false);

  // Reseed the draft whenever the dialog opens or the server column set changes.
  useEffect(() => {
    setRows(columns.map(column => ({ id: `col:${column.name}`, name: column.name, originalName: column.name })));
  }, [columns]);

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

  const items: NameListItem[] = rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    // The first column is the reflow target and can't be removed. New rows
    // (no originalName) are always removable — they only ever existed locally.
    deletable: index !== 0 || row.originalName === undefined,
    deleteDisabledReason: t('columns.deleteFirstDisabled'),
  }));

  const handleSave = async () => {
    if (hasErrors || saving) return;

    // The reorder must be a permutation of the column list the SERVER holds
    // AFTER the creates/renames commit but BEFORE any reorder. That baseline is
    // the ORIGINAL columns in their original relative order (each mapped to its
    // final, possibly-renamed name) followed by newly added columns in creation
    // order. Comparing the admin's desired row order against that baseline BY
    // IDENTITY (a rename does not move a row) means a pure rename — or a pure
    // append — emits no spurious reorder; the reorder fires only when the row
    // order genuinely diverges from the baseline.
    const finalNameByOriginal = new Map(
      rows.filter(row => row.originalName !== undefined).map(row => [row.originalName as string, row.name.trim()])
    );
    const baselineOrder = [
      ...columns
        .map(column => finalNameByOriginal.get(column.name))
        .filter((name): name is string => name !== undefined),
      ...rows.filter(row => row.originalName === undefined).map(row => row.name.trim()),
    ];
    const desiredOrder = rows.map(row => row.name.trim());
    const reordered =
      desiredOrder.length !== baselineOrder.length || desiredOrder.some((name, i) => name !== baselineOrder[i]);

    setSaving(true);
    try {
      // Sequence the sweep: every create/rename must commit before the reorder
      // is issued, or the reorder can name a column the server does not yet
      // hold and be rejected by its permutation check.
      for (const row of rows) {
        const trimmed = row.name.trim();
        if (row.originalName === undefined) {
          await onAddColumn(trimmed);
        } else if (trimmed !== row.originalName) {
          await onRenameColumn(row.originalName, trimmed);
        }
      }
      if (reordered) await onReorderColumns(desiredOrder);
      onOpenChange(false);
    } catch {
      // A failed step already surfaced its own toast in the consumer; keep the
      // dialog open with the draft intact so the admin can retry.
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    // A never-persisted row is dropped from the draft with no confirmation —
    // there is nothing on the server to reflow.
    if (row.originalName === undefined) {
      setRows(prev => prev.filter(r => r.id !== id));
      return;
    }
    setPendingDelete(row.originalName);
  };

  const deleteTarget = columns[0]?.name ?? '';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                  .filter((row): row is { id: string; name: string; originalName?: string } => row !== undefined)
              )
            }
            onAdd={() => {
              const id = `new:${nextRowId}`;
              setNextRowId(prev => prev + 1);
              setRows(prev => [...prev, { id, name: '' }]);
            }}
            onDelete={requestDelete}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('columns.cancel')}
            </Button>
            <Button type="button" onClick={handleSave} disabled={hasErrors || saving} aria-busy={saving}>
              {t('columns.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={pendingDelete !== undefined}
        onOpenChange={next => {
          if (!next) setPendingDelete(undefined);
        }}
        variant="destructive"
        title={t('columns.delete.title')}
        description={t('columns.delete.description', { name: pendingDelete ?? '', target: deleteTarget })}
        confirmLabel={t('columns.delete.confirm')}
        cancelLabel={t('columns.cancel')}
        onConfirm={() => {
          if (pendingDelete) onDeleteColumn(pendingDelete);
          setPendingDelete(undefined);
        }}
        onCancel={() => setPendingDelete(undefined)}
      />
    </>
  );
}
