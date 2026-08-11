import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type CollaboraDocumentPreviewType,
  colorByType,
  iconByType,
  typeLabelKey,
} from '@/crd/lib/collaboraDocumentPreview';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type { CollaboraDocumentPreviewType } from '@/crd/lib/collaboraDocumentPreview';

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
  /**
   * Real rendered preview image, when the backend eventually supplies one (no
   * source exists yet — always `undefined` in production today, workspace
   * story client-web#9872 P3). When present and loadable, replaces the
   * type-icon treatment; falls back to the type-icon treatment if it fails to
   * load.
   */
  previewImageUrl?: string;
  /** `default` = aspect-video (used inside the callout detail dialog);
   *  `compact` = shorter fixed height for the space feed card. */
  size?: 'default' | 'compact';
  className?: string;
};

// PDF has no create/edit concept (import-only) — the open action reads as
// view/annotate rather than "Open Document" (FR-002). Kept local rather than
// folded into the shared `@/crd/lib/collaboraDocumentPreview` maps since the
// open-button framing is specific to this preview's own action, not a
// property of the document type shared across every surface that renders it.
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
  previewImageUrl,
  size = 'default',
  className,
}: CalloutCollaboraPreviewProps) {
  const { t } = useTranslation('crd-space');
  const Icon = iconByType[documentType];
  const accentColor = colorByType[documentType];
  const typeLabel = t(typeLabelKey[documentType] as 'callout.document');
  const openLabel = t(openLabelKey[documentType] as 'callout.openDocument');
  const compact = size === 'compact';
  const [erroredUrl, setErroredUrl] = useState<string | undefined>(undefined);
  const showImage = Boolean(previewImageUrl) && previewImageUrl !== erroredUrl;

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-border bg-muted/30 relative',
        compact ? 'h-28' : 'aspect-video',
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center bg-muted">
        {showImage ? (
          <img
            src={previewImageUrl}
            alt={typeLabel}
            className="w-full h-full object-cover"
            onError={() => setErroredUrl(previewImageUrl)}
          />
        ) : (
          <Icon className={cn(compact ? 'w-8 h-8' : 'w-12 h-12', accentColor)} aria-hidden="true" />
        )}
      </div>
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-caption text-foreground shadow-sm">
          <Icon className={cn('w-3.5 h-3.5', accentColor)} aria-hidden="true" />
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
