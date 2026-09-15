import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type CollaboraDocumentPreviewType,
  colorByType,
  iconByType,
  openLabelKey,
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
   * Authorized, same-origin preview image URL for the current saved
   * document, or `undefined` when the backend has no backing file to
   * preview. When present, the image loads lazily and, once it succeeds,
   * replaces the type-icon treatment; the type-icon stays visible until then
   * and again if the image fails to load.
   */
  previewImageUrl?: string;
  /** `default` = aspect-video (used inside the callout detail dialog);
   *  `compact` = shorter fixed height for the space feed card. */
  size?: 'default' | 'compact';
  className?: string;
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
  const openLabel = t(openLabelKey[documentType]);
  const compact = size === 'compact';
  // Tracked by URL value (not a boolean) so a later `previewImageUrl` prop change
  // — e.g. after a re-render generates a fresh image — starts in the correct
  // not-yet-loaded/not-errored state without an extra effect to reset it.
  const [loadedUrl, setLoadedUrl] = useState<string | undefined>(undefined);
  const [erroredUrl, setErroredUrl] = useState<string | undefined>(undefined);
  const showImage = Boolean(previewImageUrl) && previewImageUrl !== erroredUrl;
  const imageLoaded = showImage && previewImageUrl === loadedUrl;

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-border bg-muted/30 relative',
        compact ? 'h-28' : 'aspect-video',
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center bg-muted relative">
        {/* Type icon stays mounted (and visible) until the preview image has
         * actually loaded, and again after a load error — it is never
         * replaced eagerly just because a URL was supplied. */}
        <Icon className={cn(compact ? 'w-8 h-8' : 'w-12 h-12', accentColor)} aria-hidden="true" />
        {showImage && (
          <img
            src={previewImageUrl}
            // Empty alt: the type badge below already names the document type,
            // and the card/dialog around this component carries its own
            // accessible name — this image is decorative, not a second label.
            alt=""
            loading="lazy"
            className={cn('absolute inset-0 w-full h-full object-cover', !imageLoaded && 'invisible')}
            onLoad={() => setLoadedUrl(previewImageUrl)}
            onError={() => setErroredUrl(previewImageUrl)}
          />
        )}
      </div>
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-caption text-foreground shadow-sm">
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
