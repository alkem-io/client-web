import { FileText, FileType, Presentation, RefreshCw, Sheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type CollaboraDocumentPreviewType = 'text' | 'spreadsheet' | 'presentation' | 'pdf';

type CalloutCollaboraPreviewProps = {
  documentType: CollaboraDocumentPreviewType;
  onOpen: () => void;
  /**
   * When provided, a "Replace file" action is shown on the preview so a user
   * with edit rights can swap the backing file without opening the editor
   * (workspace#014-officedocs-replace-file, FR-001). Omitted for users without
   * edit rights (FR-002).
   */
  onReplace?: () => void;
  /** `default` = aspect-video (used inside the callout detail dialog);
   *  `compact` = shorter fixed height for the space feed card. */
  size?: 'default' | 'compact';
  className?: string;
};

const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
  // Distinct from the other three so a PDF is recognizable at a glance (FR-007).
  pdf: FileType,
};

const typeLabelKey: Record<CollaboraDocumentPreviewType, string> = {
  text: 'callout.documentText',
  spreadsheet: 'callout.documentSpreadsheet',
  presentation: 'callout.documentPresentation',
  pdf: 'callout.documentPdf',
};

// PDF has no create/edit concept (import-only) — the open action reads as
// view/annotate rather than "Open Document" (FR-002).
const openLabelKey: Record<CollaboraDocumentPreviewType, string> = {
  text: 'callout.openDocument',
  spreadsheet: 'callout.openDocument',
  presentation: 'callout.openDocument',
  pdf: 'callout.openDocumentPdf',
};

export function CalloutCollaboraPreview({
  documentType,
  onOpen,
  onReplace,
  size = 'default',
  className,
}: CalloutCollaboraPreviewProps) {
  const { t } = useTranslation('crd-space');
  const Icon = iconByType[documentType];
  const typeLabel = t(typeLabelKey[documentType] as 'callout.documentText');
  const openLabel = t(openLabelKey[documentType] as 'callout.openDocument');
  const compact = size === 'compact';

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-border bg-muted/30 relative',
        compact ? 'h-28' : 'aspect-video',
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Icon className={cn(compact ? 'w-8 h-8' : 'w-12 h-12', 'text-muted-foreground/50')} aria-hidden="true" />
      </div>
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-caption text-foreground shadow-sm">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {typeLabel}
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors">
        <Button variant="secondary" className="shadow-sm" onClick={onOpen}>
          {openLabel}
        </Button>
        {onReplace && (
          <Button variant="secondary" className="shadow-sm" onClick={onReplace}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {t('callout.documentReplace')}
          </Button>
        )}
      </div>
    </div>
  );
}
