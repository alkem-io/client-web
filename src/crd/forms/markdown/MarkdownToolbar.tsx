import { type Editor, useEditorState } from '@tiptap/react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Smile,
  Undo2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmojiPicker } from '@/crd/components/common/EmojiPicker';
import { cn } from '@/crd/lib/utils';
import { Separator } from '@/crd/primitives/separator';
import { isEditorReady } from './isEditorReady';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarEmbedDialog } from './ToolbarEmbedDialog';
import { ToolbarImageDialog } from './ToolbarImageDialog';
import { ToolbarLinkDialog } from './ToolbarLinkDialog';
import { ToolbarTableOpsMenu } from './ToolbarTableOpsMenu';
import { ToolbarTablePicker } from './ToolbarTablePicker';

type MarkdownToolbarProps = {
  editor: Editor | null;
  className?: string;
  collaborative?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  iframeAllowedUrls?: string[];
  onError?: (message: string) => void;
  hideImageOptions?: boolean;
  /** Hides only the embed/iframe button (image stays). Memo doesn't support iframes. */
  hideEmbedOption?: boolean;
};

export function MarkdownToolbar({
  editor,
  className,
  collaborative = false,
  onImageUpload,
  iframeAllowedUrls,
  onError,
  hideImageOptions = false,
  hideEmbedOption = false,
}: MarkdownToolbarProps) {
  const { t } = useTranslation('crd-markdown');

  // Subscribe to selection/transaction changes via Tiptap's canonical reactive
  // hook. Without this, `editor.isActive('table')` is only evaluated on mount
  // and the toolbar never swaps between the table picker and the table-ops menu.
  const isInTable =
    useEditorState({
      editor,
      selector: ({ editor: ed }) => (ed ? ed.isActive('table') : false),
    }) ?? false;

  if (!isEditorReady(editor)) return null;

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

      {/* Table — picker when outside, ops menu when inside */}
      {!isInTable && <ToolbarTablePicker editor={editor} />}
      {isInTable && <ToolbarTableOpsMenu editor={editor} />}

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Link */}
      <ToolbarLinkDialog editor={editor} />

      {/* Image */}
      {!hideImageOptions && <ToolbarImageDialog editor={editor} onImageUpload={onImageUpload} onError={onError} />}

      {/* Embed */}
      {!hideImageOptions && !hideEmbedOption && (
        <ToolbarEmbedDialog
          editor={editor}
          iframeAllowedUrls={iframeAllowedUrls}
          onError={onError}
          disabled={isInTable}
        />
      )}

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
