import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import type { TemplateContent } from '../types';

type PostContent = Extract<TemplateContent, { type: 'post' }>;

export function PostTemplatePreview({ content }: { content: PostContent }) {
  const { t } = useTranslation('crd-templates');
  return (
    <div className="space-y-1.5">
      <p className="text-label uppercase text-muted-foreground">{t('preview.post.defaultDescription')}</p>
      {content.defaultDescription ? (
        <MarkdownContent content={content.defaultDescription} />
      ) : (
        <p className="text-body text-muted-foreground">{t('preview.empty')}</p>
      )}
    </div>
  );
}
