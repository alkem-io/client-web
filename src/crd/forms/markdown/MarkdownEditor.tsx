import { EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { MarkdownToolbar } from './MarkdownToolbar';
import { buildCrdMarkdownExtensions } from './sharedExtensions';
import { useMarkdownEditorState } from './useMarkdownEditorState';
import './styles.css';
import { Suspense } from 'react';
import { Loading } from '@/crd/components/common/Loading';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

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
  /** Applied to the editor's root element so a sibling `<label htmlFor>` can reference it. */
  id?: string;
  placeholder?: string;
  /**
   * Turns on the character counter. It counts the markdown `value` — the string
   * that is stored and validated — not the visible text, so formatting syntax and
   * link / image URLs count too. That keeps the counter in agreement with any
   * length validator applied to the same value.
   */
  maxLength?: number;
  /** The counter stays hidden until `value` reaches this many characters. Defaults to 80% of `maxLength`. */
  counterThreshold?: number;
  /**
   * The counter's tooltip adds the "formatting counts too" hint once `value`
   * reaches this many characters. Defaults to the counter threshold.
   */
  counterHintThreshold?: number;
  /** Validation message shown below the editor, on the same line as the counter. */
  error?: string;
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
  id,
  placeholder,
  maxLength,
  counterThreshold,
  counterHintThreshold,
  error,
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

  const charCount = value.length;
  const effectiveCounterThreshold = counterThreshold ?? (maxLength != null ? Math.floor(maxLength * 0.8) : 0);
  const showCounter = maxLength != null && charCount >= effectiveCounterThreshold;
  const showCounterHint = charCount >= (counterHintThreshold ?? effectiveCounterThreshold);

  return (
    <>
      <div
        id={id}
        className={cn(
          'crd-markdown-editor flex flex-col border border-border rounded-lg overflow-hidden bg-input-background transition-shadow focus-within:ring-2 focus-within:ring-primary/20',
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
      </div>

      {(error || showCounter) && (
        <div className="flex items-start gap-3">
          {error && (
            <p className="text-caption text-destructive" aria-live="polite">
              {error}
            </p>
          )}
          {showCounter && maxLength != null && (
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-label={t('editor.charCount', {
                  current: charCount.toLocaleString(),
                  max: maxLength.toLocaleString(),
                })}
                className="ml-auto shrink-0 cursor-help rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CharCountRing count={charCount} max={maxLength} />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t('editor.charCount', {
                    current: charCount.toLocaleString(),
                    max: maxLength.toLocaleString(),
                  })}
                </p>
                {showCounterHint && <p className="mt-1">{t('editor.charCountHint')}</p>}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </>
  );
}

// The viewBox matches the rendered 16px, so stroke widths are in pixels.
const RING_RADIUS = 6.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Tiny circular progress of `count` towards `max`; turns destructive once full. */
function CharCountRing({ count, max }: { count: number; max: number }) {
  const progress = Math.min(count / max, 1);
  const isFull = count >= max;
  return (
    <svg viewBox="0 0 16 16" className="size-4 -rotate-90" aria-hidden="true">
      <circle cx="8" cy="8" r={RING_RADIUS} fill="none" strokeWidth="3" className="stroke-muted" />
      <circle
        cx="8"
        cy="8"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
        className={isFull ? 'stroke-destructive' : 'stroke-primary'}
      />
    </svg>
  );
}
