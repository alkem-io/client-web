import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';
import type { TemplateContent } from '../types';

type ClassificationContent = Extract<TemplateContent, { type: 'classification' }>;

/** Read-only preview: cardinality + the value set in authored order (FR-002b). */
export function ClassificationTemplatePreview({ content }: { content: ClassificationContent }) {
  const { t } = useTranslation('crd-templates');
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-label uppercase text-muted-foreground">{t('preview.classification.cardinality')}</p>
        <p className="text-body text-foreground">
          {t(
            content.cardinality === 'SINGLE_SELECT'
              ? 'form.classification.cardinalitySingle'
              : 'form.classification.cardinalityMulti'
          )}
        </p>
      </div>
      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.classification.values')}</p>
        {content.values.length > 0 ? (
          // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
          // biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset
          <ul role="list" className="flex flex-wrap gap-1.5">
            {content.values.map(value => (
              <li key={value.id}>
                <Badge variant="secondary">{value.label}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.empty')}</p>
        )}
      </div>
    </div>
  );
}
