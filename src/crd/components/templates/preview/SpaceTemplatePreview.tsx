import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';
import { TYPE_ICON } from '../TemplateCard';
import type { TemplateContent } from '../types';

type SpaceContent = Extract<TemplateContent, { type: 'space' }>;

export function SpaceTemplatePreview({ content }: { content: SpaceContent }) {
  const { t } = useTranslation('crd-templates');
  const FramingIcon = TYPE_ICON.callout;
  const SubspaceIcon = TYPE_ICON.space;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.space.phases')}</p>
        {content.phases.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {content.phases.map((phase, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview list, never reordered; phase names may repeat
              <li key={`${phase.name}-${i}`}>
                <Badge variant="secondary" className="text-badge">
                  {phase.name}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.space.none')}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.space.starterCallouts')}</p>
        {content.starterCallouts.length > 0 ? (
          <ul className="space-y-1">
            {content.starterCallouts.map((callout, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview list, never reordered; callout names may repeat
              <li key={`${callout.name}-${i}`} className="text-body inline-flex items-center gap-2">
                <FramingIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                {callout.name}
                <Badge variant="outline" className="text-badge">
                  {t(`framingKind.${callout.framingKind}`)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.space.none')}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-label uppercase text-muted-foreground">{t('preview.space.subspaceTemplates')}</p>
        {content.subspaceTemplates.length > 0 ? (
          <ul className="space-y-1">
            {content.subspaceTemplates.map((sub, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview list, never reordered; names may repeat
              <li key={`${sub.name}-${i}`} className="text-body inline-flex items-center gap-2">
                <SubspaceIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                {sub.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted-foreground">{t('preview.space.none')}</p>
        )}
      </div>
    </div>
  );
}
