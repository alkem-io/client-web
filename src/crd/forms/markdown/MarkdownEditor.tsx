import { EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { MarkdownToolbar } from './MarkdownToolbar';
import { buildCrdMarkdownExtensions } from './sharedExtensions';
import { useMarkdownEditorState } from './useMarkdownEditorState';
import './styles.css';
import { Suspense } from 'react';
import { Loading } from '@/crd/components/common/Loading';

/**
 * The image-upload wiring a `MarkdownEditor` needs to enable copy/paste and the
 * insert-media toolbar button. Produced by `useMarkdownEditorIntegration` in the
 * integration layer and forwarded — as three flat props — by every CRD component
 * that hosts a markdown editor. Exported so those components share one definition.
 */
export type MarkdownUploadProps = {
  /** Upload callback. When provided, the image toolbar dialog shows an upload button.
   *  Must resolve to a public URL for the uploaded file. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Allowed iframe origins for the embed dialog. When unset/empty, no origin check is performed. */
  iframeAllowedUrls?: string[];
  /** Called with a user-facing error message when image / embed insertion fails validation. */
  onError?: (message: string) => void;
};

type MarkdownEditorProps = MarkdownUploadProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  /** Hides image + embed toolbar buttons (e.g. inline comment composer). */
  hideImageOptions?: boolean;
  /** Hides only the embed/iframe button (image stays) — e.g. memo, which doesn't support iframes. */
  hideEmbedOption?: boolean;
};

export function MarkdownEditor(props: MarkdownEditorProps) {
  // crd-markdown translation is lazy loaded, to avoid a loading state in a higher component use always this lazy loaded wrapper
  return (
    <Suspense fallback={<Loading />}>
      <MarkdownEditorLazy {...props} />
    </Suspense>
  );
}

function MarkdownEditorLazy({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  className,
  onImageUpload,
  iframeAllowedUrls,
  onError,
  hideImageOptions,
  hideEmbedOption,
}: MarkdownEditorProps) {
  const { t } = useTranslation('crd-markdown');

  const editorOptions = buildCrdMarkdownExtensions({
    collaborative: false,
    disabled,
    ariaLabel: placeholder ?? t('editor.toolbar'),
    onImageUpload,
    onError,
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
        'crd-markdown-editor flex flex-col border border-border rounded-lg overflow-hidden bg-background transition-shadow focus-within:ring-2 focus-within:ring-primary/20',
        disabled && 'opacity-60',
        className
      )}
    >
      <MarkdownToolbar
        editor={editor}
        className="border-b border-border bg-muted/30"
        onImageUpload={onImageUpload}
        iframeAllowedUrls={iframeAllowedUrls}
        onError={onError}
        hideImageOptions={hideImageOptions}
        hideEmbedOption={hideEmbedOption}
      />

      <EditorContent
        editor={editor}
        className="flex flex-col flex-1 min-h-0"
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
