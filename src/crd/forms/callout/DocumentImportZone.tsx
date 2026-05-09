import { Upload, X } from 'lucide-react';
import { type DragEvent, type KeyboardEvent, useId, useRef, useState } from 'react';
import { cn } from '@/crd/lib/utils';

export type DocumentImportError =
  | { kind: 'no-file' }
  | { kind: 'multiple-files' }
  | { kind: 'folder' }
  | { kind: 'extension'; received: string }
  | { kind: 'size'; bytes: number; maxBytes: number };

export type DocumentImportZoneProps = {
  /** Comma-joined extension list passed straight to `<input accept="...">`. */
  acceptAttr: string;
  /** Currently-staged file. `null` when nothing is staged. */
  value: File | null;
  /** Called when the user picks or drops a file (single-file flow). `null` clears. */
  onChange: (file: File | null) => void;
  /**
   * Called when the OS surfaces a non-file drop (folder, multi-drop, etc.).
   * The component itself does NOT validate file content; the consumer runs
   * the validator and renders the resulting error via the `error` prop.
   */
  onError: (error: DocumentImportError | null) => void;
  /** External error from the consumer's validator. Renders a `role="alert"` message. */
  error: DocumentImportError | null;
  /** While true, the zone displays an `aria-busy` indicator and rejects new picks. */
  busy?: boolean;
  /** Whether this zone is disabled (e.g. a blank-create card is selected). */
  disabled?: boolean;
  className?: string;
  // ---- i18n labels passed by the consumer (CRD components don't fetch translations beyond their namespace) ----
  /** Headline shown inside the zone. */
  labelHint: string;
  /** Sub-line beneath the headline (e.g. ".docx, .xlsx, .pptx up to 15 MB"). */
  labelMaxSize: string;
  /** ARIA label for the remove-file button when a file is staged. */
  labelRemoveFile: string;
  /** Pre-formatted error message to render. The consumer is responsible for picking the message that matches `error.kind`. */
  errorMessage: string | null;
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

export function DocumentImportZone({
  acceptAttr,
  value,
  onChange,
  onError,
  error,
  busy = false,
  disabled = false,
  className,
  labelHint,
  labelMaxSize,
  labelRemoveFile,
  errorMessage,
}: DocumentImportZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const labelId = useId();

  const handleFiles = (files: FileList | null) => {
    if (busy || disabled) return;
    if (!files || files.length === 0) {
      onChange(null);
      onError({ kind: 'no-file' });
      return;
    }
    if (files.length > 1) {
      onError({ kind: 'multiple-files' });
      return;
    }
    onError(null);
    onChange(files[0]);
  };

  const handleClick = () => {
    if (busy || disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (busy || disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (busy || disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (busy || disabled) return;
    event.preventDefault();
    setIsDragOver(false);

    // Folder drops surface as items with `kind: 'file'` and a non-standard
    // `webkitGetAsEntry()` whose `isDirectory` is true. Inspecting the
    // DataTransferItemList lets us catch folders before reading files.
    const items = event.dataTransfer.items;
    if (items) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i] as DataTransferItem & {
          webkitGetAsEntry?: () => { isDirectory: boolean } | null;
        };
        const entry = item.webkitGetAsEntry?.();
        if (entry?.isDirectory) {
          onError({ kind: 'folder' });
          return;
        }
      }
    }
    handleFiles(event.dataTransfer.files);
  };

  const handleRemove = () => {
    if (busy) return;
    onChange(null);
    onError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3',
          className
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-body-emphasis text-foreground truncate" title={value.name}>
            {value.name}
          </p>
          <p className="text-caption text-muted-foreground">{formatBytes(value.size)}</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          aria-label={labelRemoveFile}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            busy && 'opacity-50 cursor-not-allowed'
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* biome-ignore lint/a11y/useSemanticElements: a button can't host drag-drop semantics for files; this is a styled drop target */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={labelId}
        aria-busy={busy ? 'true' : undefined}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          disabled
            ? 'border-border bg-muted/20 cursor-not-allowed opacity-50'
            : isDragOver
              ? 'border-primary bg-primary/5 cursor-copy'
              : 'border-border bg-background hover:border-foreground/30 hover:bg-muted/40 cursor-pointer'
        )}
      >
        <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p id={labelId} className="text-body-emphasis text-foreground text-center">
          {labelHint}
        </p>
        <p className="text-caption text-muted-foreground text-center">{labelMaxSize}</p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          onChange={event => handleFiles(event.currentTarget.files)}
          disabled={busy || disabled}
          className="sr-only"
          tabIndex={-1}
        />
      </div>
      {error && errorMessage && (
        <p role="alert" className="text-caption text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
