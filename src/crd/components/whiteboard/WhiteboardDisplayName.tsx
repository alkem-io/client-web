import { Check, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

type WhiteboardDisplayNameProps = {
  displayName: string;
  readOnly?: boolean;
  editing?: boolean;
  onEdit?: () => void;
  onSave?: (newName: string) => void;
  onCancel?: () => void;
  saving?: boolean;
};

export function WhiteboardDisplayName({
  displayName,
  readOnly,
  editing,
  onEdit,
  onSave,
  onCancel,
  saving,
}: WhiteboardDisplayNameProps) {
  const { t } = useTranslation('crd-whiteboard');
  const [editValue, setEditValue] = useState(displayName);

  useEffect(() => {
    setEditValue(displayName);
  }, [displayName]);

  const handleSave = () => {
    onSave?.(editValue);
  };

  const handleCancel = () => {
    setEditValue(displayName);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (readOnly) {
    return <h2 className="text-lg font-semibold truncate">{displayName}</h2>;
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <Input
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={true}
          className="h-8 text-sm"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={handleSave}
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
          onClick={handleCancel}
          aria-label={t('editor.cancelEdit')}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <h2 className="text-lg font-semibold truncate">{displayName}</h2>
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
