import { Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type WhiteboardSaveFooterProps = {
  onDelete?: () => void;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  className?: string;
};

export function WhiteboardSaveFooter({ onDelete, onSave, saving, saveDisabled, className }: WhiteboardSaveFooterProps) {
  const { t } = useTranslation('crd-whiteboard');

  return (
    <div className={cn('flex items-center justify-between px-4 py-2 border-t border-border', className)}>
      <div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={t('editor.delete')}
          >
            <Trash2 className="size-4 mr-1" aria-hidden="true" />
            {t('editor.delete')}
          </Button>
        )}
      </div>
      <Button variant="default" onClick={onSave} disabled={saving || saveDisabled} aria-busy={saving}>
        {saving ? (
          <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : (
          <Save className="size-4 mr-1" aria-hidden="true" />
        )}
        {t('editor.save')}
      </Button>
    </div>
  );
}
