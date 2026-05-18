import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import type { TemplateContent } from '../types';

type CommunityGuidelinesContent = Extract<TemplateContent, { type: 'communityGuidelines' }>;

export function CommunityGuidelinesTemplatePreview({ content }: { content: CommunityGuidelinesContent }) {
  const { t } = useTranslation('crd-templates');
  return (
    <div className="space-y-6">
      {content.title && <h3 className="text-subsection-title">{content.title}</h3>}
      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.communityGuidelines.body')}</p>
        {content.guidelinesMarkdown ? (
          <MarkdownContent content={content.guidelinesMarkdown} />
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.empty')}</p>
        )}
      </div>
      {content.references.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-label uppercase text-muted-foreground">{t('preview.communityGuidelines.references')}</p>
          <ul className="space-y-1">
            {content.references.map((ref, i) => (
              <li key={ref.id ?? `${ref.uri}-${i}`}>
                <a
                  href={ref.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-emphasis text-primary inline-flex items-center gap-1.5 hover:underline"
                >
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                  {ref.name || ref.uri}
                </a>
                {ref.description && <span className="text-caption text-muted-foreground ml-2">{ref.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
