import { EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { MarkdownToolbar } from './MarkdownToolbar';
import { useEditorExtensions } from './useEditorExtensions';
import { useMarkdownEditorState } from './useMarkdownEditorState';
import './styles.css';
import { Suspense } from 'react';
import { Loading } from '@/crd/components/common/Loading';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
};

export function MarkdownEditor(props: MarkdownEditorProps) {
  // crd-markdown translation is lazy loaded, to avoid a loading state in a higher component use always this lazy loaded wrapper
  return (
    <Suspense fallback={<Loading />}>
      <MarkdownEditorLazy {...props} />
    </Suspense>
  );
}

function MarkdownEditorLazy({ value, onChange, placeholder, maxLength, disabled, className }: MarkdownEditorProps) {
  const { t } = useTranslation('crd-markdown');

  const editorOptions = useEditorExtensions({
    disabled,
    ariaLabel: placeholder ?? t('editor.toolbar'),
  });

  const { editor } = useMarkdownEditorState({
    value,
    onChange,
    editorOptions,
  });

  if (!editor) return null;

  const charCount = editor.getText().length;
  const isOverLimit = maxLength != null && charCount > maxLength;

  return (
    <div
      className={cn(
        'crd-markdown-editor border border-border rounded-lg overflow-hidden bg-background transition-shadow focus-within:ring-2 focus-within:ring-primary/20',
        disabled && 'opacity-60',
        className
      )}
    >
      <MarkdownToolbar editor={editor} className="border-b border-border bg-muted/30" />

      <EditorContent
        editor={editor}
        className="min-h-[120px]"
        {...(placeholder ? { 'data-placeholder': placeholder } : {})}
      />

      {maxLength != null && (
        <div className="flex justify-end px-3 pb-2">
          <span className={cn('text-caption', isOverLimit ? 'text-destructive' : 'text-muted-foreground')}>
            {t('editor.charCount', { count: charCount, max: maxLength })}
          </span>
        </div>
      )}
    </div>
  );
}
