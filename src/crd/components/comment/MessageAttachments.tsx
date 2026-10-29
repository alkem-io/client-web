import { Download, FileText, Loader2, Maximize2 } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutMediaGalleryCarousel,
  type CalloutMediaGalleryCarouselItem,
} from '@/crd/components/callout/CalloutMediaGalleryCarousel';
import { formatBytes } from '@/crd/lib/formatBytes';
import { cn } from '@/crd/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import type { MessageAttachment } from './types';

export type MessageMediaDownload = { url: string; displayName: string };

type MessageAttachmentsProps = {
  attachments: MessageAttachment[];
  /** Align the attachment stack — `end` for the current user's own chat
   *  bubbles (right-aligned), `start` everywhere else. */
  align?: 'start' | 'end';
  className?: string;
  /** Downloads one of the message's images or videos from the media viewer.
   *  Omit to show the viewer without its download control. */
  onDownloadMedia?: (media: MessageMediaDownload) => void;
};

const isImage = (mimeType: string | undefined) => mimeType?.startsWith('image/');
const isVideo = (mimeType: string | undefined) => mimeType?.startsWith('video/');

/** Only ever use an attachment URL as an `href`/`src` when it is an
 *  http(s) URL — belt-and-suspenders against a `javascript:`/`data:` URL slipping
 *  through. */
const isHttpUrl = (url: string | undefined): url is string => typeof url === 'string' && /^https?:\/\//i.test(url);

/**
 * Renders the media attachments on a message. Images show an inline preview
 * that opens the message's media in an in-page viewer; videos use native
 * controls without preloading the timeline, plus an expand control into the
 * same viewer. Other types render a downloadable file chip.
 * `url` is the integration-supplied media resource,
 * so web- and Element-origin attachments render identically. Images that fail
 * to load degrade to the same downloadable chip with an "unavailable" hint.
 */
export function MessageAttachments({
  attachments,
  align = 'start',
  className,
  onDownloadMedia,
}: MessageAttachmentsProps) {
  const { t } = useTranslation('crd-common');
  // Index into `galleryItems` of the media shown in the viewer; undefined = closed.
  const [galleryIndex, setGalleryIndex] = useState<number | undefined>(undefined);

  if (!attachments.length) {
    return null;
  }

  // The viewer swipes through this message's images and videos only, and only
  // those with a URL we are willing to render.
  const galleryItems: (CalloutMediaGalleryCarouselItem & { displayName: string })[] = [];
  const galleryIndexByAttachment = new Map<number, number>();
  attachments.forEach((attachment, index) => {
    const kind = isImage(attachment.mimeType) ? 'image' : isVideo(attachment.mimeType) ? 'video' : undefined;
    if (!kind || !isHttpUrl(attachment.url)) return;
    galleryIndexByAttachment.set(index, galleryItems.length);
    galleryItems.push({
      id: `${attachment.id ?? `media-${index}`}:${galleryItems.length}`,
      uri: attachment.url,
      kind,
      displayName: attachment.displayName,
      alternativeText: t(kind === 'image' ? 'messageAttachments.imageAlt' : 'messageAttachments.videoLabel', {
        name: attachment.displayName,
      }),
    });
  });

  const openGalleryAt = (attachmentIndex: number) => () =>
    setGalleryIndex(galleryIndexByAttachment.get(attachmentIndex));

  const listClassName = cn('flex flex-col gap-1.5', align === 'end' && 'items-end', className);

  return (
    <>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" aria-label={t('messageAttachments.listLabel')} className={listClassName}>
        {attachments.map((attachment, index) => (
          <li
            key={`${attachment.id ?? `unavailable-${index}`}:${attachment.retryKey ?? 0}`}
            className="max-w-[min(320px,100%)]"
          >
            {isImage(attachment.mimeType) ? (
              <AttachmentImage attachment={attachment} onOpen={openGalleryAt(index)} />
            ) : isVideo(attachment.mimeType) ? (
              <AttachmentVideo attachment={attachment} onOpen={openGalleryAt(index)} />
            ) : (
              <AttachmentFileChip attachment={attachment} />
            )}
          </li>
        ))}
      </ul>
      <Dialog
        open={galleryIndex !== undefined}
        onOpenChange={open => {
          if (!open) setGalleryIndex(undefined);
        }}
      >
        <DialogContent
          closeLabel={t('close')}
          aria-describedby={undefined}
          className="max-h-[100dvh] w-full max-w-[calc(100%-1rem)] overflow-y-auto p-2 pt-12 sm:max-w-4xl sm:p-4 sm:pt-12"
        >
          <DialogTitle className="sr-only">{t('messageAttachments.listLabel')}</DialogTitle>
          {/* The viewer's labels live in a lazily-loaded namespace; suspend here,
              not in whatever boundary sits above the thread. */}
          <Suspense
            fallback={<Loader2 aria-hidden="true" className="mx-auto size-6 animate-spin text-muted-foreground" />}
          >
            {galleryIndex !== undefined && (
              <CalloutMediaGalleryCarousel
                items={galleryItems}
                initialIndex={galleryIndex}
                onDownload={
                  onDownloadMedia
                    ? item => {
                        const media = galleryItems.find(candidate => candidate.id === item.id);
                        if (media) onDownloadMedia({ url: media.uri, displayName: media.displayName });
                      }
                    : undefined
                }
              />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AttachmentImage({ attachment, onOpen }: { attachment: MessageAttachment; onOpen: () => void }) {
  const { t } = useTranslation('crd-common');
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Retry presentation when the resolved URL changes.
  useEffect(() => {
    setStatus('loading');
  }, [attachment.url]);

  // Briefly-unfetchable / broken image, or a non-http(s) URL we won't honour →
  // fall back to the same downloadable chip the non-image branch uses, with an
  // explanatory hint (FR-017). Guards the `href`/`src` below.
  if (status === 'error' || !isHttpUrl(attachment.url)) {
    return <AttachmentFileChip attachment={attachment} hint={t('messageAttachments.unavailableHint')} />;
  }

  // The image's own intrinsic ratio reserves the final height *before* the bytes
  // arrive, so nothing in the thread shifts when it lands. Note this must live on
  // the <img> and must not be paired with an explicit height: an explicit
  // `height` fully determines the box and `aspect-ratio` is then ignored, which
  // is why the fixed-height fallback below is applied only when the server did
  // not give us dimensions.
  const aspectStyle =
    attachment.width && attachment.height ? { aspectRatio: `${attachment.width} / ${attachment.height}` } : undefined;

  return (
    <div className="group/media relative overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('messageAttachments.openMedia', { name: attachment.displayName })}
        className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {/* Overlays the image rather than replacing it — see the `img` note below. */}
        {status === 'loading' && (
          <output aria-label={t('messageAttachments.loading')} className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={attachment.url}
          alt={t('messageAttachments.imageAlt', { name: attachment.displayName })}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => {
            setStatus('error');
            attachment.onLoadError?.();
          }}
          // Never take the image OUT of the layout while it loads. A
          // `loading="lazy"` image that is `display: none` is never intersected by
          // the browser's lazy-load observer, so it is never fetched, `onLoad`
          // never fires, and the skeleton stays forever. Fade it in instead — it
          // keeps its box (and therefore its reserved height) the whole time.
          className={cn(
            'block max-h-80 w-full object-cover transition-opacity duration-200',
            // Without server dimensions there is no ratio to reserve, so fall back
            // to a fixed placeholder height until the real image sizes itself.
            !aspectStyle && status !== 'loaded' ? 'h-32' : 'h-auto',
            status !== 'loaded' && 'opacity-0'
          )}
          style={aspectStyle}
        />
      </button>
      <AttachmentDownload attachment={attachment} />
    </div>
  );
}

function AttachmentVideo({ attachment, onOpen }: { attachment: MessageAttachment; onOpen: () => void }) {
  const { t } = useTranslation('crd-common');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [attachment.url]);

  if (failed || !isHttpUrl(attachment.url)) {
    return <AttachmentFileChip attachment={attachment} hint={t('messageAttachments.videoUnavailableHint')} />;
  }

  return (
    <div className="group/media relative overflow-hidden rounded-lg border border-border">
      {/* User-provided clips have no caption track supplied by the attachment API. */}
      {/* biome-ignore lint/a11y/useMediaCaption: no caption track is available for uploaded attachments */}
      <video
        src={attachment.url}
        controls={true}
        playsInline={true}
        preload="none"
        aria-label={t('messageAttachments.videoLabel', { name: attachment.displayName })}
        onLoadedMetadata={event => {
          if (event.currentTarget.videoWidth === 0) {
            setFailed(true);
          }
        }}
        onError={() => {
          setFailed(true);
          attachment.onLoadError?.();
        }}
        className="block aspect-video max-h-80 w-80 max-w-full bg-black object-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('messageAttachments.openMedia', { name: attachment.displayName })}
        className={cn(MEDIA_ACTION_CLASS, 'right-11')}
      >
        <Maximize2 aria-hidden="true" className="size-4" />
      </button>
      <AttachmentDownload attachment={attachment} />
    </div>
  );
}

// Shared by the overlay actions on an image/video: always visible on touch,
// revealed on hover/focus where the device can hover.
const MEDIA_ACTION_CLASS =
  'absolute top-2 z-10 flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground opacity-100 shadow-md transition-opacity hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [@media(hover:hover)]:opacity-0 group-hover/media:opacity-100 group-focus-within/media:opacity-100 focus-visible:opacity-100';

function AttachmentDownload({ attachment }: { attachment: MessageAttachment }) {
  const { t } = useTranslation('crd-common');

  return (
    <a
      href={attachment.url}
      download={attachment.displayName}
      aria-label={t('messageAttachments.download', { name: attachment.displayName })}
      className={cn(MEDIA_ACTION_CLASS, 'right-2')}
    >
      <Download aria-hidden="true" className="size-4" />
    </a>
  );
}

function AttachmentFileChip({ attachment, hint }: { attachment: MessageAttachment; hint?: string }) {
  const { t } = useTranslation('crd-common');
  const formattedSize = attachment.size === undefined ? '' : formatBytes(attachment.size);
  // Only treat an http(s) URL as downloadable; anything else is
  // surfaced as an unavailable, non-interactive chip.
  const downloadable = isHttpUrl(attachment.url);
  // A non-downloadable chip renders as a non-interactive <span> with no link to
  // follow, so it must never carry a "download it to view" hint — not even the
  // one the image fallback passes explicitly, which assumes a usable document
  // URL. Those chips get the generic unavailable message instead.
  const effectiveHint = downloadable ? hint : t('messageAttachments.unavailableNoDownload');

  const body = (
    <>
      <FileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-emphasis text-foreground">{attachment.displayName}</span>
        {effectiveHint ? (
          <span className="block text-caption text-muted-foreground">{effectiveHint}</span>
        ) : (
          formattedSize && <span className="block text-caption text-muted-foreground">{formattedSize}</span>
        )}
      </span>
      {downloadable && <Download aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
    </>
  );

  const chipClassName =
    'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors';

  if (!downloadable) {
    return <span className={chipClassName}>{body}</span>;
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.displayName}
      aria-label={t('messageAttachments.download', { name: attachment.displayName })}
      className={cn(
        chipClassName,
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {body}
    </a>
  );
}
