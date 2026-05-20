import { Pencil, Presentation, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

export type CalloutWhiteboardContributionPreviewData = {
  id: string;
  title: string;
  author?: { name: string; avatarUrl?: string; profileUrl?: string };
  timestamp?: string;
  /** Pre-rendered whiteboard thumbnail returned by the server (WHITEBOARD_PREVIEW visual). */
  previewUrl?: string;
};

type CalloutWhiteboardContributionPreviewProps = {
  whiteboard: CalloutWhiteboardContributionPreviewData;
  loading?: boolean;
  /** Opens the full collaborative whiteboard editor. Wired by the consumer. */
  onOpen: () => void;
  /** Render the edit button when the consumer wires `onEdit`. */
  onEdit?: () => void;
  /** Mount point for the share trigger (e.g. the CRD `ShareButton`). */
  shareSlot?: ReactNode;
  /** Closing the preview returns to the contributions grid in the parent. */
  onClose?: () => void;
  className?: string;
};

/**
 * Inline read-only preview of a selected whiteboard contribution rendered
 * inside the callout detail dialog. Mirrors the MUI
 * `CalloutContributionPreview` + `CalloutContributionPreviewWhiteboard` pair:
 * a card-like header with title / author / timestamp / action cluster, and a
 * 16:9 thumbnail body with a "Click to see the full whiteboard" overlay that
 * launches the collaborative editor via `onOpen`.
 */
export function CalloutWhiteboardContributionPreview({
  whiteboard,
  loading,
  onOpen,
  onEdit,
  shareSlot,
  onClose,
  className,
}: CalloutWhiteboardContributionPreviewProps) {
  const { t } = useTranslation('crd-space');

  return (
    <section
      className={cn('rounded-lg border border-primary/40 bg-card overflow-hidden', className)}
      aria-label={t('whiteboardPreview.label')}
    >
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3 min-w-0">
          {whiteboard.author &&
            (whiteboard.author.profileUrl ? (
              <a
                href={whiteboard.author.profileUrl}
                onClick={e => e.stopPropagation()}
                aria-label={whiteboard.author.name}
                className="relative z-10 block shrink-0 rounded-full -m-0.5 p-0.5 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="w-9 h-9 border border-border">
                  {whiteboard.author.avatarUrl && (
                    <AvatarImage src={whiteboard.author.avatarUrl} alt={whiteboard.author.name} />
                  )}
                  <AvatarFallback>{whiteboard.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </a>
            ) : (
              <Avatar className="w-9 h-9 border border-border shrink-0">
                {whiteboard.author.avatarUrl && (
                  <AvatarImage src={whiteboard.author.avatarUrl} alt={whiteboard.author.name} />
                )}
                <AvatarFallback>{whiteboard.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          <div className="min-w-0">
            <h3 className="text-card-title text-foreground truncate">
              {loading ? <Skeleton className="h-4 w-40" /> : whiteboard.title}
            </h3>
            {(whiteboard.author || whiteboard.timestamp) && (
              <p className="text-caption text-muted-foreground truncate">
                {whiteboard.author?.profileUrl ? (
                  <a
                    href={whiteboard.author.profileUrl}
                    onClick={e => e.stopPropagation()}
                    className="relative z-10 rounded-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {whiteboard.author.name}
                  </a>
                ) : (
                  whiteboard.author?.name
                )}
                {whiteboard.author && whiteboard.timestamp && ' • '}
                {whiteboard.timestamp}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={t('whiteboardPreview.edit')}
              onClick={onEdit}
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          {shareSlot}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={t('whiteboardPreview.close')}
              onClick={onClose}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </header>

      <button
        type="button"
        onClick={onOpen}
        aria-label={t('whiteboardPreview.openFull')}
        className="group block w-full bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-video bg-muted/30 border-b border-border overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : whiteboard.previewUrl ? (
            <img
              src={whiteboard.previewUrl}
              alt={whiteboard.title}
              className="w-full h-full object-contain transition-transform group-hover:scale-[1.01]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Presentation className="size-12 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-primary/0 group-hover:bg-primary/10 transition-colors">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-label uppercase text-primary-foreground bg-primary px-3 py-1.5 rounded-md shadow-sm">
              {t('whiteboardPreview.openFull')}
            </span>
          </div>
        </div>
      </button>
    </section>
  );
}
