import type { Editor } from '@tiptap/react';
import { Pencil, Table as TableIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import { isEditorReady } from './isEditorReady';

const MAX_SIZE = 8;

type ToolbarTablePickerProps = {
  editor: Editor;
};

export function ToolbarTablePicker({ editor }: ToolbarTablePickerProps) {
  const { t } = useTranslation('crd-markdown');
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
  const [customMode, setCustomMode] = useState(false);
  const [customRows, setCustomRows] = useState(MAX_SIZE);
  const [customCols, setCustomCols] = useState(MAX_SIZE);

  if (!isEditorReady(editor)) return null;

  const handleInsert = (rows: number, cols: number) => {
    if (rows <= 0 || cols <= 0) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setOpen(false);
    setHovered({ rows: 0, cols: 0 });
    setCustomMode(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setCustomMode(false);
      setHovered({ rows: 0, cols: 0 });
    }
  };

  const cells: React.ReactNode[] = [];
  for (let r = 1; r <= MAX_SIZE; r++) {
    for (let c = 1; c <= MAX_SIZE; c++) {
      const highlighted = r <= hovered.rows && c <= hovered.cols;
      cells.push(
        <button
          type="button"
          key={`${r}-${c}`}
          onMouseEnter={() => setHovered({ rows: r, cols: c })}
          onClick={() => handleInsert(r, c)}
          aria-label={t('editor.table.cellAria', { rows: r, cols: c })}
          className={`size-5 border border-border transition-colors ${
            highlighted ? 'bg-primary/70' : 'bg-background hover:bg-muted'
          }`}
        />
      );
    }
  }

  const validCustom = customRows > 0 && customCols > 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild={true}>
        <button
          type="button"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shrink-0"
          aria-label={t('editor.insertTable')}
        >
          <TableIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-[70] w-auto p-2" align="start">
        {!customMode ? (
          <>
            {/* biome-ignore lint/a11y/noStaticElementInteractions: mouseLeave only resets hover state — accessible interaction is delegated to per-cell buttons */}
            <div
              className="grid gap-[2px] cursor-pointer"
              style={{ gridTemplateColumns: `repeat(${MAX_SIZE}, 1fr)` }}
              onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
            >
              {cells}
            </div>
            <p className="text-caption text-center text-muted-foreground mt-2">
              {hovered.cols > 0
                ? t('editor.table.gridSize', { cols: hovered.cols, rows: hovered.rows })
                : t('editor.insertTable')}
            </p>
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className="mt-2 w-full inline-flex items-center gap-2 px-2 py-1.5 rounded-md text-control hover:bg-muted/50 transition-colors"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
              {t('editor.table.custom')}
            </button>
          </>
        ) : (
          <div className="space-y-3 p-2 min-w-[220px]">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-caption font-medium block mb-1" htmlFor="crd-table-cols">
                  {t('editor.table.columns')}
                </label>
                <Input
                  id="crd-table-cols"
                  type="number"
                  min={1}
                  value={customCols}
                  onChange={e => setCustomCols(parseInt(e.target.value, 10) || 0)}
                  className="h-8"
                />
              </div>
              <span className="text-caption text-muted-foreground mt-5">×</span>
              <div className="flex-1">
                <label className="text-caption font-medium block mb-1" htmlFor="crd-table-rows">
                  {t('editor.table.rows')}
                </label>
                <Input
                  id="crd-table-rows"
                  type="number"
                  min={1}
                  value={customRows}
                  onChange={e => setCustomRows(parseInt(e.target.value, 10) || 0)}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setCustomMode(false)}>
                {t('editor.cancel')}
              </Button>
              <Button size="sm" onClick={() => handleInsert(customRows, customCols)} disabled={!validCustom}>
                {t('editor.ok')}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
