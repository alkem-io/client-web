import { useTranslation } from 'react-i18next';
import { InnovationPackCard } from '@/crd/components/innovationPack/InnovationPackCard';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type { TemplateCardData } from '@/crd/components/templates/types';
import { Skeleton } from '@/crd/primitives/skeleton';
import { TemplateGallery } from './TemplateGallery';
import { TemplateTypeFilter, type TemplateTypeFilterValue } from './TemplateTypeFilter';

export type InnovationLibraryViewProps = {
  /** Store-listed Innovation Packs — cards link to each pack's public profile via `pack.url`. */
  packs: InnovationPackCardData[];
  packsLoading?: boolean;
  /** All platform templates — already type-filtered by the consumer. */
  templates: TemplateCardData[];
  templatesLoading?: boolean;
  activeTypeFilter: TemplateTypeFilterValue;
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void;
  onTemplatePreview: (templateId: string) => void;
};

const PACK_SKELETON_KEYS = ['p1', 'p2', 'p3'];

/**
 * Innovation Library body — an Innovation Packs section + a type-filterable
 * Template Gallery. The page (`CrdInnovationLibraryPage`) wraps this with a
 * heading and mounts the `TemplatePreviewDialog` itself (see the contract note
 * in `incongruencies.md` re: the dropped inline preview pane).
 */
export function InnovationLibraryView({
  packs,
  packsLoading,
  templates,
  templatesLoading,
  activeTypeFilter,
  onChangeTypeFilter,
  onTemplatePreview,
}: InnovationLibraryViewProps) {
  const { t } = useTranslation('crd-templates');

  return (
    <div className="space-y-10">
      <section aria-labelledby="crd-library-packs-heading" className="space-y-4">
        <h2 id="crd-library-packs-heading" className="text-section-title">
          {t('library.packs.heading')}
        </h2>
        {packsLoading ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACK_SKELETON_KEYS.map(key => (
              <li key={key}>
                <Skeleton className="h-72 w-full rounded-lg" />
              </li>
            ))}
          </ul>
        ) : packs.length === 0 ? (
          <p className="py-6 text-body text-muted-foreground">{t('library.packs.empty')}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map(pack => (
              <li key={pack.id}>
                <InnovationPackCard pack={pack} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="crd-library-templates-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="crd-library-templates-heading" className="text-section-title">
            {t('library.templates.heading')}
          </h2>
          <TemplateTypeFilter value={activeTypeFilter} onChange={onChangeTypeFilter} />
        </div>
        <TemplateGallery
          templates={templates}
          loading={templatesLoading}
          onPreview={onTemplatePreview}
          emptyLabel={t('library.templates.empty')}
        />
      </section>
    </div>
  );
}
