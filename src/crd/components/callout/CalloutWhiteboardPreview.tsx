import { Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type CalloutWhiteboardPreviewProps = {
  previewUrl?: string;
  onOpen: () => void;
  className?: string;
};

export function CalloutWhiteboardPreview({ previewUrl, onOpen, className }: CalloutWhiteboardPreviewProps) {
  const { t } = useTranslation('crd-space');

  // The whole preview is the click target (cursor-pointer everywhere), not just the centered label —
  // matching the contribution cards. The "Open Whiteboard" label is a non-interactive <span> (nesting a
  // <button> inside this <button> would be invalid).
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative block w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-muted/30 aspect-video text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Presentation className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <span className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-sm h-9 px-4 text-control">
          {t('callout.openWhiteboard')}
        </span>
      </div>
    </button>
  );
}
