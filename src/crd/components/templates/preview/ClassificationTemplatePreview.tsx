import { useTranslation } from 'react-i18next';
import type { TemplateContent } from '../types';

type ClassificationContent = Extract<TemplateContent, { type: 'classification' }>;

/**
 * Read-only preview (product#2161 design 07): a meta line (cardinality ·
 * value count) and the value set as a numbered two-column grid — the numbers
 * make the authored order (FR-002b) visible.
 */
export function ClassificationTemplatePreview({ content }: { content: ClassificationContent }) {
  const { t } = useTranslation('crd-templates');
  return (
    <div className="space-y-4">
      <p className="text-body text-muted-foreground">
        {t(
          content.cardinality === 'SINGLE_SELECT'
            ? 'preview.classification.singleSelect'
            : 'preview.classification.multiSelect'
        )}
        {' · '}
        {t('preview.classification.valueCount', { count: content.values.length })}
      </p>
      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.classification.definedValues')}</p>
        {content.values.length > 0 ? (
          // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
          // biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset
          <ol role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {content.values.map((value, index) => (
              <li key={value.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-caption font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="text-body text-foreground truncate">{value.label}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.empty')}</p>
        )}
      </div>
    </div>
  );
}
