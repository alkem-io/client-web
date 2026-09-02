import { Check, Pencil, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

type WhiteboardDisplayNameProps = {
  /** The persisted display name (shown when not editing) */
  displayName: string;
  /** Controlled input value while editing. Required when `editing` is true. */
  value?: string;
  readOnly?: boolean;
  editing?: boolean;
  saving?: boolean;
  onChange?: (value: string) => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

export function WhiteboardDisplayName({
  displayName,
  value,
  readOnly,
  editing,
  saving,
  onChange,
  onEdit,
  onSave,
  onCancel,
}: WhiteboardDisplayNameProps) {
  const { t } = useTranslation('crd-whiteboard');

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      <div className="flex items-center gap-1 min-w-0">
        <Input
          value={value ?? ''}
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
          aria-label={t('editor.saveDisplayName')}
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
          aria-label={t('editor.cancelEdit')}
        >
          <X className="size-4" />
        </Button>
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
        aria-label={t('editor.editDisplayName')}
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}
