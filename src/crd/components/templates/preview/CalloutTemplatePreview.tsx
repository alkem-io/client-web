import { ExternalLink, FileText, ImageIcon, MessageSquare, MessageSquareOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { Badge } from '@/crd/primitives/badge';
import type { TemplateContent } from '../types';

type CalloutContent = Extract<TemplateContent, { type: 'callout' }>;

function FramingBody({ content }: { content: CalloutContent }) {
  const { t } = useTranslation('crd-templates');
  switch (content.framingKind) {
    case 'memo':
      return content.framingMemoContent ? <MarkdownContent content={content.framingMemoContent} /> : null;
    case 'document':
      return (
        <p className="text-body text-muted-foreground inline-flex items-center gap-2">
          <FileText aria-hidden="true" className="size-4" />
          {content.framingCollaboraDoc?.displayName || t('framingKind.document')}
        </p>
      );
    case 'cta':
      return content.framingLinks && content.framingLinks.length > 0 ? (
        <ul className="space-y-1">
          {content.framingLinks.map((link, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview list, never reordered
            <li key={`${link.uri}-${i}`}>
              <a
                href={link.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-emphasis text-primary inline-flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
                {link.name || link.uri}
              </a>
            </li>
          ))}
        </ul>
      ) : null;
    case 'image':
      return content.framingMediaImages && content.framingMediaImages.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {content.framingMediaImages.map((img, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview list, never reordered
            <li key={`${img.uri}-${i}`} className="aspect-video overflow-hidden rounded-md border">
              <img src={img.uri} alt={img.alt ?? ''} className="size-full object-cover" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-muted-foreground inline-flex items-center gap-2">
          <ImageIcon aria-hidden="true" className="size-4" />
          {t('preview.callout.gallery')}
        </p>
      );
    case 'poll':
      return (
        <div className="space-y-2">
          {content.framingPoll?.question && (
            <p className="text-body-emphasis">
              {t('preview.callout.pollQuestion')}: {content.framingPoll.question}
            </p>
          )}
          {content.framingPoll?.options && content.framingPoll.options.length > 0 && (
            <ul className="space-y-1">
              {content.framingPoll.options.map((opt, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview list, never reordered; poll options may repeat
                <li key={`${opt}-${i}`} className="text-body rounded-md border px-3 py-1.5">
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case 'whiteboard':
      // D16 (2026-05-18): render the server-stamped preview image when present, falling back to
      // the placeholder text only when the visual is genuinely missing.
      return content.framingWhiteboardPreviewImageUrl ? (
        <div className="overflow-hidden rounded-md border bg-muted">
          <img
            src={content.framingWhiteboardPreviewImageUrl}
            alt={content.framingTitle || t('framingKind.whiteboard')}
            className="w-full object-contain"
          />
        </div>
      ) : (
        <p className="text-body text-muted-foreground">{t('framingKind.whiteboard')}</p>
      );
    default:
      return null;
  }
}

export function CalloutTemplatePreview({ content }: { content: CalloutContent }) {
  const { t } = useTranslation('crd-templates');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-badge">
            {t(`framingKind.${content.framingKind}`)}
          </Badge>
          {content.commentsEnabled ? (
            <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
              <MessageSquare aria-hidden="true" className="size-3.5" />
              {t('preview.callout.comments')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
              <MessageSquareOff aria-hidden="true" className="size-3.5" />
              {t('preview.callout.commentsDisabled')}
            </span>
          )}
        </div>
        {content.framingTitle && <h3 className="text-subsection-title">{content.framingTitle}</h3>}
        {content.framingDescription && <MarkdownContent content={content.framingDescription} />}
        <FramingBody content={content} />
      </div>

      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.callout.allowedContributions')}</p>
        {content.allowedContributionTypes.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {content.allowedContributionTypes.map(ct => (
              <li key={ct}>
                <Badge variant="outline" className="text-badge">
                  {t(`contributionType.${ct}`)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.callout.noContributions')}</p>
        )}
      </div>

      {content.defaultPostDescription && (
        <div className="space-y-1.5">
          <p className="text-label uppercase text-muted-foreground">{t('preview.callout.defaultPostDescription')}</p>
          <MarkdownContent content={content.defaultPostDescription} />
        </div>
      )}

      {content.defaultWhiteboardContent && (
        <div className="space-y-1.5">
          <p className="text-label uppercase text-muted-foreground">{t('preview.callout.defaultWhiteboard')}</p>
          <p className="text-body text-muted-foreground">{t('framingKind.whiteboard')}</p>
        </div>
      )}
    </div>
  );
}
