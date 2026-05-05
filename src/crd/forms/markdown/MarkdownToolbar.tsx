import type { Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Rows3,
  Smile,
  Table,
  TableCellsMerge,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiPicker } from '@/crd/components/common/EmojiPicker';
import { cn } from '@/crd/lib/utils';
import { Separator } from '@/crd/primitives/separator';
import { isEditorReady } from './isEditorReady';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarLinkDialog } from './ToolbarLinkDialog';

type MarkdownToolbarProps = {
  editor: Editor | null;
  className?: string;
  collaborative?: boolean;
};

export function MarkdownToolbar({ editor, className, collaborative = false }: MarkdownToolbarProps) {
  const { t } = useTranslation('crd-markdown');
  const [, setTick] = useState(0);

  // Refresh table context on transactions
  useEffect(() => {
    if (!editor) return;
    const handler = () => setTick(tick => tick + 1);
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);

  if (!isEditorReady(editor)) return null;

  const isInTable = editor.isActive('table');

  const handleEmojiSelect = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
  };

  return (
    <div
      role="toolbar"
      aria-label={t('editor.toolbar')}
      className={cn('flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto', className)}
    >
      {/* Undo / Redo — hidden in collaborative mode (Yjs owns history) */}
      {!collaborative && (
        <>
          <ToolbarButton editor={editor} icon={Undo2} label={t('editor.undo')} command={c => c.undo()} />
          <ToolbarButton editor={editor} icon={Redo2} label={t('editor.redo')} command={c => c.redo()} />
          <Separator orientation="vertical" className="mx-1 h-5" />
        </>
      )}

      {/* Text formatting */}
      <ToolbarButton
        editor={editor}
        icon={Bold}
        label={t('editor.bold')}
        command={c => c.toggleBold()}
        isActive="bold"
      />
      <ToolbarButton
        editor={editor}
        icon={Italic}
        label={t('editor.italic')}
        command={c => c.toggleItalic()}
        isActive="italic"
      />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Headings */}
      <ToolbarButton
        editor={editor}
        icon={Heading1}
        label={t('editor.heading1')}
        command={c => c.toggleHeading({ level: 1 })}
        isActive={['heading', { level: 1 }]}
      />
      <ToolbarButton
        editor={editor}
        icon={Heading2}
        label={t('editor.heading2')}
        command={c => c.toggleHeading({ level: 2 })}
        isActive={['heading', { level: 2 }]}
      />
      <ToolbarButton
        editor={editor}
        icon={Heading3}
        label={t('editor.heading3')}
        command={c => c.toggleHeading({ level: 3 })}
        isActive={['heading', { level: 3 }]}
      />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Lists + blocks */}
      <ToolbarButton
        editor={editor}
        icon={List}
        label={t('editor.bulletList')}
        command={c => c.toggleBulletList()}
        isActive="bulletList"
        disabled={isInTable}
      />
      <ToolbarButton
        editor={editor}
        icon={ListOrdered}
        label={t('editor.orderedList')}
        command={c => c.toggleOrderedList()}
        isActive="orderedList"
        disabled={isInTable}
      />
      <ToolbarButton
        editor={editor}
        icon={Quote}
        label={t('editor.blockquote')}
        command={c => c.toggleBlockquote()}
        isActive="blockquote"
        disabled={isInTable}
      />
      <ToolbarButton
        editor={editor}
        icon={Code}
        label={t('editor.codeBlock')}
        command={c => c.toggleCodeBlock()}
        isActive="codeBlock"
        disabled={isInTable}
      />
      <ToolbarButton
        editor={editor}
        icon={Minus}
        label={t('editor.horizontalRule')}
        command={c => c.setHorizontalRule()}
        disabled={isInTable}
      />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Table operations */}
      {!isInTable && (
        <ToolbarButton
          editor={editor}
          icon={Table}
          label={t('editor.insertTable')}
          command={c => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true })}
        />
      )}
      {isInTable && (
        <>
          <ToolbarButton
            editor={editor}
            icon={TableCellsMerge}
            label={t('editor.deleteTable')}
            command={c => c.deleteTable()}
          />
          <ToolbarButton
            editor={editor}
            icon={Columns3}
            label={t('editor.addColumn')}
            command={c => c.addColumnAfter()}
          />
          <ToolbarButton editor={editor} icon={Rows3} label={t('editor.addRow')} command={c => c.addRowAfter()} />
          <ToolbarButton
            editor={editor}
            icon={Trash2}
            label={t('editor.deleteColumn')}
            command={c => c.deleteColumn()}
          />
        </>
      )}

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Link */}
      <ToolbarLinkDialog editor={editor} />

      {/* Emoji */}
      <EmojiPicker
        onSelect={handleEmojiSelect}
        trigger={
          <button
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shrink-0"
            aria-label={t('editor.emoji')}
          >
            <Smile className="w-4 h-4" aria-hidden="true" />
          </button>
        }
      />
    </div>
  );
}
