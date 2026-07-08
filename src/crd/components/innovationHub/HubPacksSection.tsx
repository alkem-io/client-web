import { useTranslation } from 'react-i18next';
import { InnovationPackCard } from '@/crd/components/innovationPack/InnovationPackCard';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';

export type HubPacksSectionProps = {
  /** The hub's curated Innovation Packs, in stored (curated) order. */
  packs: InnovationPackCardData[];
};

const GRID_CLASS = 'grid gap-6 list-none p-0 m-0 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]';

/**
 * "Innovation Packs" band on the Innovation Hub home page. Follows the
 * `HubSpacesSection` section pattern (heading + auto-fill grid) but as a plain
 * full listing — no search, filters, counter, or load-more (spec assumption:
 * hub owners control volume via curation). Cards are the Innovation Library's
 * `InnovationPackCard`, reused verbatim (FR-004). Renders nothing at all when
 * the list is empty (FR-007).
 */
export function HubPacksSection({ packs }: HubPacksSectionProps) {
  const { t } = useTranslation('crd-innovationHub');

  if (packs.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-section-title mb-6 text-foreground">{t('home.packsSection.title')}</h2>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight strips list semantics from a grid <ul>; the role restores them */}
      {/* biome-ignore lint/a11y/useSemanticElements: the <ul> IS the semantic element — the role is reaffirming, not substituting */}
      <ul role="list" className={GRID_CLASS} aria-label={t('home.packsSection.packsLabel')}>
        {packs.map(pack => (
          <li key={pack.id}>
            <InnovationPackCard pack={pack} />
          </li>
        ))}
      </ul>
    </section>
  );
}
