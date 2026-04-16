import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ContributionFormLayoutProps = {
  type: 'post' | 'memo' | 'whiteboard' | 'link';
  title: { value: string; onChange: (v: string) => void; error?: string };
  description?: { value: string; onChange: (v: string) => void; error?: string };
  tags?: { value: string; onChange: (v: string) => void };
  // Link-specific
  linkUrl?: { value: string; onChange: (v: string) => void; error?: string };
  linkDescription?: { value: string; onChange: (v: string) => void };
  // Slots
  editorSlot?: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  className?: string;
};

export function ContributionFormLayout({
  type,
  title,
  description,
  tags,
  linkUrl,
  linkDescription,
  editorSlot,
  onSubmit,
  onCancel,
  className,
}: ContributionFormLayoutProps) {
  const { t } = useTranslation(['crd-space', 'crd-common']);

  return (
    <div className={cn('space-y-4 p-4 border border-border rounded-lg bg-card', className)}>
      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="contribution-title" className="text-caption text-muted-foreground">
          {t('forms.titleLabel')}
        </label>
        <input
          id="contribution-title"
          type="text"
          value={title.value}
          onChange={e => title.onChange(e.target.value)}
          placeholder={t('forms.titlePlaceholder')}
          className={cn(
            'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
            title.error ? 'border-destructive' : 'border-border'
          )}
        />
        {title.error && <p className="text-caption text-destructive">{title.error}</p>}
      </div>

      {/* Description (Post, Memo) */}
      {(type === 'post' || type === 'memo') && description && (
        <div className="space-y-1">
          <label htmlFor="contribution-description" className="text-caption text-muted-foreground">
            {t('forms.descriptionLabel')}
          </label>
          {editorSlot ?? (
            <textarea
              id="contribution-description"
              value={description.value}
              onChange={e => description.onChange(e.target.value)}
              placeholder={t('forms.descriptionPlaceholder')}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
      )}

      {/* Link fields */}
      {type === 'link' && linkUrl && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="contribution-link-url" className="text-caption text-muted-foreground">
              {t('forms.linkUrl')}
            </label>
            <input
              id="contribution-link-url"
              type="url"
              value={linkUrl.value}
              onChange={e => linkUrl.onChange(e.target.value)}
              placeholder={t('forms.linkUrlPlaceholder')}
              className={cn(
                'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
                linkUrl.error ? 'border-destructive' : 'border-border'
              )}
            />
            {linkUrl.error && <p className="text-caption text-destructive">{linkUrl.error}</p>}
          </div>
          {linkDescription && (
            <div className="space-y-1">
              <label htmlFor="contribution-link-description" className="text-caption text-muted-foreground">
                {t('forms.descriptionLabel')}
              </label>
              <textarea
                id="contribution-link-description"
                value={linkDescription.value}
                onChange={e => linkDescription.onChange(e.target.value)}
                placeholder={t('forms.descriptionPlaceholder')}
                className="w-full min-h-[60px] px-3 py-2 border border-border rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Tags (Post) */}
      {type === 'post' && tags && (
        <div className="space-y-1">
          <label htmlFor="contribution-tags" className="text-caption text-muted-foreground">
            {t('forms.tagsLabel')}
          </label>
          <input
            id="contribution-tags"
            type="text"
            value={tags.value}
            onChange={e => tags.onChange(e.target.value)}
            placeholder={t('forms.tagsLabel')}
            className="w-full h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Whiteboard editor slot */}
      {type === 'whiteboard' && editorSlot}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t('crd-common:cancel')}
        </Button>
        <Button size="sm" onClick={onSubmit}>
          {t('forms.publish')}
        </Button>
      </div>
    </div>
  );
}
