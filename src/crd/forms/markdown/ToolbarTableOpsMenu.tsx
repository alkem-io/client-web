import type { ChainedCommands, Editor } from '@tiptap/react';
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Table as TableIcon,
  Trash2,
  XSquare,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { isEditorReady } from './isEditorReady';

type ToolbarTableOpsMenuProps = {
  editor: Editor;
};

export function ToolbarTableOpsMenu({ editor }: ToolbarTableOpsMenuProps) {
  const { t } = useTranslation('crd-markdown');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  if (!isEditorReady(editor)) return null;

  const saveSelection = () => {
    savedSelectionRef.current = { from: editor.state.selection.from, to: editor.state.selection.to };
  };

  const run = (cmd: (c: ChainedCommands) => ChainedCommands) => {
    const saved = savedSelectionRef.current;
    const chain = editor.chain().focus();
    if (saved) chain.setTextSelection(saved);
    cmd(chain).run();
    savedSelectionRef.current = null;
  };

  return (
    <>
      <DropdownMenu
        onOpenChange={open => {
          if (open) saveSelection();
        }}
      >
        <DropdownMenuTrigger asChild={true}>
          <button
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-muted text-foreground transition-colors shrink-0"
            aria-label={t('editor.table.operations')}
            aria-pressed={true}
          >
            <TableIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[70]" align="start">
          <DropdownMenuItem onClick={() => run(c => c.addColumnBefore())}>
            <ArrowLeftToLine className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.table.addColumnBefore')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(c => c.addColumnAfter())}>
            <ArrowRightToLine className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.table.addColumnAfter')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(c => c.deleteColumn())}>
            <XSquare className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.deleteColumn')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => run(c => c.addRowBefore())}>
            <ArrowUpToLine className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.table.addRowBefore')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(c => c.addRowAfter())}>
            <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.table.addRowAfter')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(c => c.deleteRow())}>
            <XSquare className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.deleteRow')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('editor.deleteTable')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        variant="destructive"
        title={t('editor.deleteTable')}
        description={t('editor.table.deleteConfirm')}
        confirmLabel={t('editor.table.deleteConfirmAction')}
        cancelLabel={t('editor.cancel')}
        onConfirm={() => {
          run(c => c.deleteTable());
          setConfirmDelete(false);
        }}
      />
    </>
  );
}
