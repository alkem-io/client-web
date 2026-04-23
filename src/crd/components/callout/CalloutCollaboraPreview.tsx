import { FileText, Presentation, Sheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type CollaboraDocumentPreviewType = 'text' | 'spreadsheet' | 'presentation';

type CalloutCollaboraPreviewProps = {
  documentType: CollaboraDocumentPreviewType;
  onOpen: () => void;
  className?: string;
};

const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

const typeLabelKey: Record<CollaboraDocumentPreviewType, string> = {
  text: 'callout.documentText',
  spreadsheet: 'callout.documentSpreadsheet',
  presentation: 'callout.documentPresentation',
};

export function CalloutCollaboraPreview({ documentType, onOpen, className }: CalloutCollaboraPreviewProps) {
  const { t } = useTranslation('crd-space');
  const Icon = iconByType[documentType];
  const typeLabel = t(typeLabelKey[documentType] as 'callout.documentText');

  return (
    <div className={cn('rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video', className)}>
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Icon className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
      </div>
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-caption text-foreground shadow-sm">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {typeLabel}
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors">
        <Button variant="secondary" className="shadow-sm" onClick={onOpen}>
          {t('callout.openDocument')}
        </Button>
      </div>
    </div>
  );
}
