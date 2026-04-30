import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '@/crd/components/common/Loading';
import { cn } from '@/crd/lib/utils';
import type { CollabProviderLike, YDocLike } from './collabProviderTypes';
import { MarkdownToolbar } from './MarkdownToolbar';
import { buildCrdMarkdownExtensions } from './sharedExtensions';
import './styles.css';

type CollaborativeMarkdownEditorProps = {
  ydoc: YDocLike;
  provider: CollabProviderLike;
  user: { name: string; color: string };
  disabled?: boolean;
  placeholder?: string;
  onReady?: (editor: Editor) => void;
  className?: string;
};

// Local Suspense boundary contains the lazy `crd-markdown` namespace load. Without it the
// suspension bubbles up to the page-level Suspense in CrdSpacePageLayout, which hides the
// entire page (and any host dialog) on the first open before the namespace is cached.
export function CollaborativeMarkdownEditor(props: CollaborativeMarkdownEditorProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CollaborativeMarkdownEditorLazy {...props} />
    </Suspense>
  );
}

function CollaborativeMarkdownEditorLazy({
  ydoc,
  provider,
  user,
  disabled,
  placeholder,
  onReady,
  className,
}: CollaborativeMarkdownEditorProps) {
  const { t } = useTranslation('crd-markdown');

  const editorOptions = buildCrdMarkdownExtensions({
    collaborative: true,
    ydoc,
    provider,
    user,
    disabled,
    ariaLabel: placeholder ?? t('editor.toolbar'),
  });

  const editor = useEditor(editorOptions, [ydoc, provider]);

  // useEditor only reads options on mount; update editable when `disabled` changes at runtime
  // (e.g. when Hocuspocus finishes initial sync and `synced` flips true → editorDisabled becomes false).
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (editor && onReady) {
      onReady(editor);
    }
  }, [editor, onReady]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'crd-markdown-editor flex flex-col h-full border border-border rounded-lg overflow-hidden bg-background',
        disabled && 'opacity-60',
        className
      )}
    >
      <MarkdownToolbar editor={editor} collaborative={true} className="border-b border-border bg-muted/30 shrink-0" />
      <EditorContent
        editor={editor}
        className="flex-1 min-h-0 overflow-y-auto"
        {...(placeholder ? { 'data-placeholder': placeholder } : {})}
      />
    </div>
  );
}
