import { Download, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '@/crd/lib/formatBytes';
import { cn } from '@/crd/lib/utils';
import type { MessageAttachment } from './types';

type MessageAttachmentsProps = {
  attachments: MessageAttachment[];
  /** Align the attachment stack — `end` for the current user's own chat
   *  bubbles (right-aligned), `start` everywhere else. */
  align?: 'start' | 'end';
  className?: string;
};

const isImage = (mimeType: string | undefined) => mimeType?.startsWith('image/');

/** Only ever use a server-issued attachment URL as an `href`/`src` when it is an
 *  http(s) URL — belt-and-suspenders against a `javascript:`/`data:` URL slipping
 *  through. */
const isHttpUrl = (url: string | undefined): url is string => typeof url === 'string' && /^https?:\/\//i.test(url);

/**
 * Renders the media attachments on a message (feature 013). Images show an
 * inline preview that links to the full document; every other type renders a
 * downloadable file chip. `url` is an already-authorized Alkemio document URL,
 * so web- and Element-origin attachments render identically. Images that fail
 * to load degrade to the same downloadable chip with an "unavailable" hint.
 */
export function MessageAttachments({ attachments, align = 'start', className }: MessageAttachmentsProps) {
  const { t } = useTranslation('crd-common');

  if (!attachments.length) {
    return null;
  }

  const listClassName = cn('flex flex-col gap-1.5', align === 'end' && 'items-end', className);

  return (
    // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
    // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
    <ul role="list" aria-label={t('messageAttachments.listLabel')} className={listClassName}>
      {attachments.map((attachment, index) => (
        <li key={attachment.id ?? `unavailable-${index}`} className="max-w-[min(320px,100%)]">
          {isImage(attachment.mimeType) ? (
            <AttachmentImage attachment={attachment} />
          ) : (
            <AttachmentFileChip attachment={attachment} />
          )}
        </li>
      ))}
    </ul>
  );
}

function AttachmentImage({ attachment }: { attachment: MessageAttachment }) {
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
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        onError={() => setStatus('error')}
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
    </a>
  );
}

function AttachmentFileChip({ attachment, hint }: { attachment: MessageAttachment; hint?: string }) {
  const { t } = useTranslation('crd-common');
  const formattedSize = attachment.size === undefined ? '' : formatBytes(attachment.size);
  // Only treat a server-issued http(s) URL as downloadable; anything else is
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
