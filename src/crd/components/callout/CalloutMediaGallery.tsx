import { ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type MediaImage = {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
};

type CalloutMediaGalleryProps = {
  images: MediaImage[];
  canEdit: boolean;
  onAddImage?: () => void;
  className?: string;
};

export function CalloutMediaGallery({ images, canEdit, onAddImage, className }: CalloutMediaGalleryProps) {
  const { t } = useTranslation('crd-space');

  if (images.length === 0 && !canEdit) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(image => (
              <div key={image.id} className="aspect-square rounded-lg overflow-hidden border border-border bg-muted/30">
                <img
                  src={image.url}
                  alt={image.altText ?? ''}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
        </div>
      )}

      {canEdit && (
        <Button variant="outline" size="sm" className="gap-2" onClick={onAddImage}>
          <ImagePlus className="w-4 h-4" aria-hidden="true" />
          {t('callout.mediaGallery')}
        </Button>
      )}

      {images.length === 0 && canEdit && (
        <button
          type="button"
          className="w-full aspect-video border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onAddImage}
          aria-label={t('callout.mediaGallery')}
        >
          <ImagePlus className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
