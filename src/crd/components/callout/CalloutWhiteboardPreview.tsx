import { Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CalloutWhiteboardPreviewProps = {
  previewUrl?: string;
  onOpen: () => void;
  className?: string;
};

export function CalloutWhiteboardPreview({ previewUrl, onOpen, className }: CalloutWhiteboardPreviewProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video', className)}>
      {previewUrl ? (
        <img src={previewUrl} alt={t('callout.whiteboard')} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Presentation className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors">
        <Button variant="secondary" className="shadow-sm" onClick={onOpen}>
          {t('callout.openWhiteboard')}
        </Button>
      </div>
    </div>
  );
}
