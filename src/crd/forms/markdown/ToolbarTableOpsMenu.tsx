import type { ChainedCommands, Editor } from '@tiptap/react';
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Settings2,
  Trash2,
  XSquare,
} from 'lucide-react';
import { useState } from 'react';
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

  if (!isEditorReady(editor)) return null;

  const run = (cmd: (c: ChainedCommands) => ChainedCommands) => cmd(editor.chain().focus()).run();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <button
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shrink-0"
            aria-label={t('editor.table.operations')}
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
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
