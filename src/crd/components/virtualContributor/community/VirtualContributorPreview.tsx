import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import type { VirtualContributorPreviewProps } from './VirtualContributorPreview.types';

/**
 * Detail preview of a single Virtual Contributor shown between selecting it in
 * the invite dialog and committing to add/invite. Mirrors the legacy MUI
 * `PreviewContributorDialog`. Pure presentational — all data + actions via props.
 */
export function VirtualContributorPreview({
  data,
  loading,
  onBack,
  onAction,
  actionLabel,
  actionBusy = false,
}: VirtualContributorPreviewProps) {
  const { t } = useTranslation('crd-community');

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col gap-4 py-2 flex-1 min-h-0 overflow-y-auto">
        {loading || !data ? (
          <output className="block py-10 text-center text-muted-foreground" aria-label={t('inviteVc.loading')}>
            <Loader2 aria-hidden="true" className="inline size-5 animate-spin" />
          </output>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="size-12 shrink-0">
                {data.avatarUrl ? <AvatarImage src={data.avatarUrl} alt="" /> : null}
                <AvatarFallback
                  style={{ background: 'color-mix(in srgb, var(--info) 15%, transparent)', color: 'var(--info)' }}
                  className="text-body-emphasis"
                >
                  {data.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="text-subsection-title truncate">{data.displayName}</h3>
                {data.host && (
                  <p className="text-caption text-muted-foreground truncate">
                    {t('inviteVc.preview.hostedBy', { name: data.host.displayName })}
                  </p>
                )}
              </div>
            </div>

            {data.tags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="uppercase text-label text-muted-foreground">{t('inviteVc.preview.tagsLabel')}</span>
                <ul className="flex flex-wrap gap-1.5">
                  {data.tags.map(tag => (
                    <li key={tag}>
                      <Badge variant="secondary" className="text-badge">
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.description ? (
              <MarkdownContent content={data.description} className="text-body text-foreground [&_p]:text-foreground" />
            ) : (
              <p className="text-body text-muted-foreground">{t('inviteVc.preview.noDescription')}</p>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between gap-2 pt-4 shrink-0">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden="true" className="mr-1.5 size-4" />
          {t('inviteVc.back')}
        </Button>
        <Button type="button" onClick={onAction} disabled={loading || !data || actionBusy} aria-busy={actionBusy}>
          {actionBusy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : actionLabel}
        </Button>
      </div>
    </div>
  );
}
