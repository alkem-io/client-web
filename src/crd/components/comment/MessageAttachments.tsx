import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import type { MessageAttachment } from './types';

type MessageAttachmentsProps = {
  attachments: MessageAttachment[];
  /** Align the attachment stack — `end` for the current user's own chat
   *  bubbles (right-aligned), `start` everywhere else. */
  align?: 'start' | 'end';
  className?: string;
};

// Base-1024 units, so the labels are the IEC binary ones (KiB/MiB/…).
const BYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

/** Pure, self-contained byte formatter so the design-system component keeps no
 *  host-app imports. */
function formatBytes(size: number): string {
  if (!size || size <= 0) {
    return '';
  }
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = size / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${BYTE_UNITS[exponent]}`;
}

const isImage = (mimeType: string) => mimeType.startsWith('image/');

/** Only ever use a server-issued attachment URL as an `href`/`src` when it is an
 *  http(s) URL — belt-and-suspenders against a `javascript:`/`data:` URL slipping
 *  through. */
const isHttpUrl = (url: string) => /^https?:\/\//i.test(url);

/**
 * Renders the media attachments on a message (feature 013). Images show an
 * inline preview that links to the full document; every other type renders a
 * downloadable file chip. `url` is an already-authorized Alkemio document URL,
 * so web- and Element-origin attachments render identically. Images that fail
 * to load (e.g. briefly unfetchable while the document is being re-homed — FR-017)
 * degrade to the same downloadable chip with an "unavailable" hint.
 */
export function MessageAttachments({ attachments, align = 'start', className }: MessageAttachmentsProps) {
  const { t } = useTranslation('crd-common');

  if (!attachments.length) {
    return null;
  }

  return (
    <ul
      aria-label={t('messageAttachments.listLabel')}
      className={cn('flex flex-col gap-1.5', align === 'end' && 'items-end', className)}
    >
      {attachments.map(attachment => (
        <li key={attachment.id} className="max-w-[min(320px,100%)]">
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

  // Briefly-unfetchable / broken image, or a non-http(s) URL we won't honour →
  // fall back to the same downloadable chip the non-image branch uses, with an
  // explanatory hint (FR-017). Guards the `href`/`src` below.
  if (status === 'error' || !isHttpUrl(attachment.url)) {
    return <AttachmentFileChip attachment={attachment} hint={t('messageAttachments.unavailableHint')} />;
  }

  const aspectStyle =
    attachment.width && attachment.height ? { aspectRatio: `${attachment.width} / ${attachment.height}` } : undefined;

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {status === 'loading' && (
        <output
          aria-label={t('messageAttachments.loading')}
          className="flex h-32 w-full animate-pulse items-center justify-center bg-muted"
          style={aspectStyle}
        />
      )}
      <img
        src={attachment.url}
        alt={t('messageAttachments.imageAlt', { name: attachment.displayName })}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn('h-auto max-h-80 w-full object-cover', status !== 'loaded' && 'hidden')}
        style={aspectStyle}
      />
    </a>
  );
}

function AttachmentFileChip({ attachment, hint }: { attachment: MessageAttachment; hint?: string }) {
  const { t } = useTranslation('crd-common');
  const formattedSize = formatBytes(attachment.size);
  // Only treat a server-issued http(s) URL as downloadable; anything else is
  // surfaced as an unavailable, non-interactive chip.
  const downloadable = isHttpUrl(attachment.url);
  const effectiveHint = hint ?? (downloadable ? undefined : t('messageAttachments.unavailableHint'));

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
