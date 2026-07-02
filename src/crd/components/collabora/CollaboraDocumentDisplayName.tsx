import { Check, Pencil, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

type CollaboraDocumentDisplayNameProps = {
  /** The persisted display name (shown when not editing) */
  displayName: string;
  /** Controlled input value while editing. Required when `editing` is true. */
  value?: string;
  readOnly?: boolean;
  editing?: boolean;
  saving?: boolean;
  /** Validation / save error message shown beneath the input while editing. */
  error?: string | null;
  onChange?: (value: string) => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

/**
 * Inline rename control for a Collabora (OfficeDocs) document title. Mirrors
 * `WhiteboardDisplayName` / `MemoDisplayName` (pencil → input → Check/Cancel;
 * Enter=save, Escape=cancel) so the rename interaction is consistent across
 * collaborative content types. Reused by the editor header and the standalone
 * rename dialog, and reusable by a future documents-as-contributions surface.
 */
export function CollaboraDocumentDisplayName({
  displayName,
  value,
  readOnly,
  editing,
  saving,
  error,
  onChange,
  onEdit,
  onSave,
  onCancel,
}: CollaboraDocumentDisplayNameProps) {
  const { t } = useTranslation('crd-space');

  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent saving/cancelling multiple times while a save is in flight.
    if (saving) {
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  if (readOnly) {
    return <h2 className="text-subsection-title truncate">{displayName}</h2>;
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <Input
            value={value ?? ''}
            aria-label={t('collabora.rename.inputLabel')}
            aria-invalid={error ? true : undefined}
            onChange={e => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={true}
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={onSave}
            disabled={saving}
            aria-label={t('collabora.rename.save')}
          >
            {saving ? (
              <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={onCancel}
            aria-label={t('collabora.rename.cancel')}
          >
            <X className="size-4" />
          </Button>
        </div>
        {error && <p className="text-caption text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <h2 className="text-subsection-title truncate">{displayName}</h2>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onEdit}
        aria-label={t('collabora.rename.edit')}
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}
