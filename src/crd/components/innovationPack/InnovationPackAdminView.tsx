import { useTranslation } from 'react-i18next';
import { TemplatesManagerView } from '@/crd/components/templates/TemplatesManagerView';
import { Separator } from '@/crd/primitives/separator';
import { InnovationPackForm } from './InnovationPackForm';
import type { InnovationPackAdminViewProps } from './types';

/**
 * Pack admin layout — the pack-details edit form above, the holder-agnostic
 * templates-manager view below.
 *
 * No "Delete pack" action here. Pack deletion is exposed from the three-dot
 * menu on each pack card in the **Account** tab's packs list (FR-042), the
 * same place the legacy app deletes account-owned packs.
 */
export function InnovationPackAdminView({ form, templatesManager }: InnovationPackAdminViewProps) {
  const { t } = useTranslation('crd-templates');
  return (
    <div className="space-y-8">
      <section aria-labelledby="pack-details-heading" className="space-y-3">
        <header className="space-y-1">
          <h2 id="pack-details-heading" className="text-section-title">
            {t('packAdmin.detailsHeading')}
          </h2>
          <p className="text-body text-muted-foreground">{t('packAdmin.detailsSubtitle')}</p>
        </header>
        <InnovationPackForm {...form} />
      </section>

      <Separator />

      <section aria-labelledby="pack-templates-heading" className="space-y-3">
        <header className="space-y-1">
          <h2 id="pack-templates-heading" className="text-section-title">
            {t('packAdmin.templatesHeading')}
          </h2>
          <p className="text-body text-muted-foreground">{t('packAdmin.subtitle')}</p>
        </header>
        <TemplatesManagerView {...templatesManager} />
      </section>
    </div>
  );
}
