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
  /**
   * Whether to render the inline confirm (✓) / cancel (✕) buttons while editing.
   * Default `true` for the standalone editor title bar, where the control owns
   * its own commit. Pass `false` in the callout edit form, where committing is
   * driven by the form's own Save button (the pencil just opens the input);
   * Enter still commits and Escape still cancels via the keyboard.
   */
  showActions?: boolean;
  onChange?: (value: string) => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

/**
 * Inline rename control for a Collabora (OfficeDocs) document title. Click the
 * pencil to open an input; Enter commits and Escape reverts.
 *
 * Two commit surfaces depending on context (`showActions`):
 *   - Editor title bar (`showActions` defaults to true): the control owns its
 *     commit via the ✓ / ✕ buttons (mirrors WhiteboardDisplayName/MemoDisplayName).
 *   - Callout edit form (`showActions={false}`): no ✓ / ✕ — the surrounding
 *     form's Save button drives the commit, so the rename persists together with
 *     the rest of the form. A dirty field is assumed intended; an unchanged field
 *     is a no-op (both handled in `useRenameCollaboraDocument`).
 */
export function CollaboraDocumentDisplayName({
  displayName,
  value,
  readOnly,
  editing,
  saving,
  error,
  showActions = true,
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
            disabled={saving}
            className="h-8"
          />
          {showActions ? (
            <>
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
            </>
          ) : (
            // Form-driven commit: no buttons, but keep a saving affordance for
            // the moment the form's Save fires the rename mutation.
            saving && (
              <output
                className="size-4 shrink-0 border-2 border-current border-t-transparent rounded-full animate-spin"
                aria-label={t('collabora.rename.saving')}
              />
            )
          )}
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
