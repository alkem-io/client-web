import { useTranslation } from 'react-i18next';
import type { VirtualContributorCardItem } from '@/crd/components/common/profileTypes';
import { VirtualContributorCard } from '@/crd/components/virtualContributor/VirtualContributorCard';

export type HubVirtualContributorsSectionProps = {
  /** The hub's curated Virtual Contributors, in stored (curated) order. */
  virtualContributors: VirtualContributorCardItem[];
};

/**
 * "Virtual Contributors" band on the Innovation Hub home page. Same section
 * pattern as `HubPacksSection` (heading + grid, no search/filters/pagination),
 * rendering the shared `VirtualContributorCard` in the User Profile's grid
 * density (FR-005). Renders nothing at all when the list is empty (FR-007).
 */
const GRID_CLASS = 'grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0';

export function HubVirtualContributorsSection({ virtualContributors }: HubVirtualContributorsSectionProps) {
  const { t } = useTranslation('crd-innovationHub');

  if (virtualContributors.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-section-title mb-6 text-foreground">{t('home.virtualContributorsSection.title')}</h2>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight strips list semantics from a grid <ul>; the role restores them */}
      {/* biome-ignore lint/a11y/useSemanticElements: the <ul> IS the semantic element — the role is reaffirming, not substituting */}
      <ul role="list" className={GRID_CLASS} aria-label={t('home.virtualContributorsSection.virtualContributorsLabel')}>
        {virtualContributors.map(vc => (
          <li key={vc.id}>
            <VirtualContributorCard vc={vc} />
          </li>
        ))}
      </ul>
    </section>
  );
}
