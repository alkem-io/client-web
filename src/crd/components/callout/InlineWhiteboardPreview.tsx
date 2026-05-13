import { Pencil, Presentation, Trash2 } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type InlineWhiteboardPreviewProps = {
  onEdit: () => void;
  /** When provided, a trash button appears top-right to clear the content. */
  onDelete?: () => void;
  /** Accessible label for the Edit affordance (the button + the clickable box). */
  editLabel: string;
  /** Accessible label for the Delete affordance (only used when onDelete is set). */
  deleteLabel?: string;
  /** Alt text used when the preview image is shown. */
  imageAlt?: string;
  /**
   * Rendered thumbnail of the saved whiteboard content. Set after the user has
   * edited the whiteboard in `CrdSingleUserWhiteboardDialog` — the dialog hands
   * back preview blobs that the connector converts to an object URL.
   */
  previewImageUrl?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Inline whiteboard preview used in form contexts (create-post framing, contribution-defaults
 * dialog) — mirrors MUI's `FormikWhiteboardPreview`: a large preview the user clicks to edit,
 * with an Edit button bottom-right and an optional Delete button top-right.
 *
 * When the consumer provides `previewImageUrl`, the canvas shows the actual rendered content
 * (typically a Blob URL from the form's `whiteboardPreviewImages`). Without one, a placeholder
 * icon stands in.
 */
export function InlineWhiteboardPreview({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  imageAlt,
  previewImageUrl,
  disabled,
  className,
}: InlineWhiteboardPreviewProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        aria-label={editLabel}
        className={cn(
          'group block w-full rounded-lg overflow-hidden border border-border bg-muted/30',
          'aspect-video flex items-center justify-center',
          'transition-colors hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {previewImageUrl ? (
          <img src={previewImageUrl} alt={imageAlt ?? ''} className="w-full h-full object-contain bg-background" />
        ) : (
          <Presentation className="size-12 text-muted-foreground/50" aria-hidden="true" />
        )}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onDelete();
          }}
          disabled={disabled}
          aria-label={deleteLabel ?? editLabel}
          className={cn(
            'absolute top-2 right-2 size-8 flex items-center justify-center rounded-md bg-background border border-border shadow-sm',
            'text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onEdit();
        }}
        disabled={disabled}
        aria-label={editLabel}
        className={cn(
          'absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-md',
          'bg-primary text-primary-foreground shadow-sm',
          'hover:bg-primary/90 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-60 text-control font-medium'
        )}
      >
        <Pencil className="size-4" aria-hidden="true" />
        {editLabel}
      </button>
    </div>
  );
}
