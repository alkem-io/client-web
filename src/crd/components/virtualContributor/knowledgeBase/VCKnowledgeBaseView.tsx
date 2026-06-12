import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InlineEditMarkdown } from '@/crd/components/common/InlineEditMarkdown';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { VcKnowledgeBaseViewProps } from './VCKnowledgeBaseView.types';

/**
 * Full-page CRD view of a Virtual Contributor's Knowledge Base (Body of
 * Knowledge). Pure presentational — identity header, read-only description,
 * refresh control, empty state, and a `calloutsSlot` for the knowledge body
 * (filled by the integration layer with the CRD callouts feed).
 */
export function VCKnowledgeBaseView({
  loading,
  noAccess,
  displayName,
  avatarUrl,
  avatarColor,
  description,
  canEditDescription,
  onSaveDescription,
  descriptionMaxLength,
  descriptionUpload,
  refresh,
  canAddCallout,
  onAddCallout,
  calloutsSlot,
  isEmpty,
}: VcKnowledgeBaseViewProps) {
  const { t } = useTranslation('crd-profilePages');

  if (loading) {
    return (
      <output
        className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-6"
        aria-label={t('knowledgeBase.loading')}
      >
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </output>
    );
  }

  if (noAccess) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <h1 className="text-page-title">{t('knowledgeBase.noAccess.title')}</h1>
        <p className="mt-2 text-body text-muted-foreground">{t('knowledgeBase.noAccess.description')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback style={backgroundGradient(avatarColor)} className="text-white">
              <BookOpen aria-hidden="true" className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-page-title truncate">{t('knowledgeBase.title')}</h1>
            <p className="text-caption text-muted-foreground truncate">{displayName}</p>
          </div>
        </div>

        {(refresh.canRefresh || canAddCallout) && (
          <div className="flex items-center gap-3">
            {refresh.canRefresh && (
              <>
                <span className="text-caption text-muted-foreground">
                  {t('knowledgeBase.lastUpdated')} {refresh.lastUpdatedValue ?? t('knowledgeBase.never')}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={refresh.onRefresh}
                  disabled={refresh.refreshing}
                  aria-busy={refresh.refreshing}
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={refresh.refreshing ? 'mr-1.5 size-4 animate-spin' : 'mr-1.5 size-4'}
                  />
                  {t('knowledgeBase.refresh')}
                </Button>
              </>
            )}
            {canAddCallout && (
              <Button type="button" size="sm" onClick={onAddCallout}>
                <Plus aria-hidden="true" className="mr-1.5 size-4" />
                {t('knowledgeBase.addCallout')}
              </Button>
            )}
          </div>
        )}
      </header>

      {canEditDescription && onSaveDescription ? (
        <InlineEditMarkdown
          value={description ?? ''}
          onSave={onSaveDescription}
          maxLength={descriptionMaxLength}
          labels={{
            edit: t('knowledgeBase.description.edit'),
            empty: t('knowledgeBase.description.empty'),
            placeholder: t('knowledgeBase.description.placeholder'),
            save: t('knowledgeBase.description.save'),
            cancel: t('knowledgeBase.description.cancel'),
            saving: t('knowledgeBase.description.saving'),
          }}
          onImageUpload={descriptionUpload?.onImageUpload}
          iframeAllowedUrls={descriptionUpload?.iframeAllowedUrls}
          onError={descriptionUpload?.onError}
        />
      ) : description ? (
        <MarkdownContent content={description} className="text-body text-foreground" />
      ) : (
        <p className="text-body text-muted-foreground italic">{t('knowledgeBase.description.empty')}</p>
      )}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <BookOpen aria-hidden="true" className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-subheader">{t('knowledgeBase.empty.title')}</h2>
          <p className="mt-1 text-body text-muted-foreground">{t('knowledgeBase.empty.description')}</p>
          {canAddCallout && (
            <Button type="button" size="sm" className="mt-4" onClick={onAddCallout}>
              <Plus aria-hidden="true" className="mr-1.5 size-4" />
              {t('knowledgeBase.addCallout')}
            </Button>
          )}
        </div>
      ) : (
        calloutsSlot
      )}
    </div>
  );
}
