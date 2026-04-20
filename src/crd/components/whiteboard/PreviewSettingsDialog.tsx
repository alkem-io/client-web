import { Crop, Lock, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type PreviewMode = 'AUTO' | 'CUSTOM' | 'FIXED'; // graphql-schema: WhiteboardPreviewMode

type PreviewSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedMode: PreviewMode;
  onSelectAuto: () => void;
  onSelectCustom: () => void;
  onSelectFixed: () => void;
  loadingAuto?: boolean;
  loadingCrop?: boolean;
};

const modeConfig = {
  AUTO: { icon: Wand2, titleKey: 'preview.modes.AUTO.title', descKey: 'preview.modes.AUTO.description' },
  CUSTOM: { icon: Crop, titleKey: 'preview.modes.CUSTOM.title', descKey: 'preview.modes.CUSTOM.description' },
  FIXED: { icon: Lock, titleKey: 'preview.modes.FIXED.title', descKey: 'preview.modes.FIXED.description' },
} as const;

const modes: PreviewMode[] = ['AUTO', 'CUSTOM', 'FIXED'] as const;

export function PreviewSettingsDialog({
  open,
  onClose,
  selectedMode,
  onSelectAuto,
  onSelectCustom,
  onSelectFixed,
  loadingAuto,
  loadingCrop,
}: PreviewSettingsDialogProps) {
  const { t } = useTranslation('crd-whiteboard');

  const handlers: Record<PreviewMode, () => void> = {
    AUTO: onSelectAuto,
    CUSTOM: onSelectCustom,
    FIXED: onSelectFixed,
  };

  const isLoading = (mode: PreviewMode) => {
    if (mode === 'AUTO') return loadingAuto;
    return (mode === 'CUSTOM' || mode === 'FIXED') && loadingCrop;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" closeLabel={t('preview.crop.cancel')}>
        <DialogHeader>
          <DialogTitle>{t('preview.settings.title')}</DialogTitle>
          <p className="text-body text-muted-foreground">{t('preview.settings.subtitle')}</p>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {modes.map(mode => {
            const config = modeConfig[mode];
            const Icon = config.icon;
            const selected = selectedMode === mode;
            const loading = isLoading(mode);

            return (
              <button
                key={mode}
                type="button"
                onClick={handlers[mode]}
                disabled={loading}
                className={cn(
                  'flex items-start gap-3 w-full rounded-lg border p-4 text-left transition-colors cursor-pointer',
                  'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected ? 'border-primary' : 'border-border'
                )}
              >
                <div className="rounded-md bg-muted p-2 shrink-0">
                  {loading ? (
                    <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Icon className="size-5" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <span className="text-body-emphasis">{t(config.titleKey)}</span>
                  <p className="text-caption text-muted-foreground mt-0.5">{t(config.descKey)}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('preview.crop.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
