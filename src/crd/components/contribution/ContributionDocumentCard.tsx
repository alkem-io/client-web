import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type CollaboraDocumentPreviewType, colorByType, iconByType } from '@/crd/lib/collaboraDocumentPreview';
import { cn } from '@/crd/lib/utils';

type ContributionDocumentCardProps = {
  title: string;
  documentType: CollaboraDocumentPreviewType;
  previewUrl?: string;
  author?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * Card for a document contribution — structurally mirrors
 * `ContributionWhiteboardCard` (fixed-height box, hover "Open Document"
 * overlay, title/author gradient footer). Renders a preview image when
 * available, falling back to the type-specific icon on load error or when
 * no preview URL is provided.
 */
export function ContributionDocumentCard({
  title,
  documentType,
  previewUrl,
  author,
  onClick,
  className,
}: ContributionDocumentCardProps) {
  const { t } = useTranslation('crd-space');
  const Icon = iconByType[documentType];
  const accentColor = colorByType[documentType];

  // Track which URL failed so we fall back to the icon without re-trying the same broken URL.
  const [erroredUrl, setErroredUrl] = useState<string | undefined>(undefined);
  const showImage = Boolean(previewUrl) && previewUrl !== erroredUrl;

  return (
    <button
      type="button"
      className={cn(
        'group/doc relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[200px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left',
        className
      )}
      onClick={onClick}
    >
      {showImage ? (
        <img
          src={previewUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/doc:scale-105"
          onError={() => setErroredUrl(previewUrl)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon className={cn('w-8 h-8', accentColor)} aria-hidden="true" />
        </div>
      )}

      {/* Hover "Open Document" button overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/doc:opacity-100 transition-opacity duration-200 bg-primary/40">
        <span className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-lg h-8 px-3 text-caption font-semibold">
          {t('callout.openDocument')}
        </span>
      </div>

      {/* Title/author gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-3 flex flex-col justify-end pointer-events-none">
        <p className="text-white text-caption font-semibold truncate">{title}</p>
        {author && <p className="text-white/70 text-badge truncate">{author}</p>}
      </div>
    </button>
  );
}
