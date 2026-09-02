/**
 * Design contract — CRD `InnovationLibraryView` prop additions (feature 103).
 *
 * The view stays PRESENTATIONAL (CRD rules): all data + behaviour arrive as
 * props; it renders Load-More controls + totals and calls the callbacks. No
 * Apollo, no domain, no routing. Existing props (packs, templates,
 * activeTypeFilter, onChangeTypeFilter, onTemplatePreview) are retained.
 *
 * This is a contract sketch for planning — NOT the implementation file.
 */

import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type { TemplateCardData } from '@/crd/components/templates/types';
import type { TemplateTypeFilterValue } from '@/crd/components/innovationLibrary/TemplateTypeFilter';

export type InnovationLibraryViewContract = {
  // --- Packs section ---
  packs: InnovationPackCardData[];
  packsLoading?: boolean; // first-page load → skeletons
  packsTotal: number; // shown in the section heading
  hasMorePacks: boolean; // controls Load-More visibility (hidden when false)
  loadingMorePacks?: boolean; // Load-More button aria-busy/disabled
  onLoadMorePacks: () => void; // appends the next page

  // --- Templates section ---
  templates: TemplateCardData[]; // server order (newest-first); already type-filtered server-side
  templatesLoading?: boolean;
  templatesTotal: number;
  hasMoreTemplates: boolean;
  loadingMoreTemplates?: boolean;
  onLoadMoreTemplates: () => void;

  // --- Type filter (now server-side) ---
  activeTypeFilter: TemplateTypeFilterValue;
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void;

  // --- Preview (unchanged) ---
  onTemplatePreview: (templateId: string) => void;
};

/**
 * UX rules encoded by this contract:
 * - Load-More is a real <button> with aria-busy={loadingMore*}; HIDDEN (not just
 *   disabled) when hasMore* is false (FR-008).
 * - Each section shows its total in the heading AND an "X of T" progress count
 *   (X = items loaded = templates.length / packs.length; T = *Total) rendered
 *   IMMEDIATELY ADJACENT to the Load-More control (FR-003). The "X of T" count
 *   stays visible (reading "T of T") on the last page when the button is hidden.
 * - Empty (total 0) renders the existing empty-state, "0 of 0", and no Load-More
 *   (FR-013).
 * - Subsequent-page loading keeps already-visible items mounted (FR-011) — the
 *   skeleton grid is only for the first page (templatesLoading/packsLoading).
 * - Reuse the `crd-common:loadMore` i18n label; counts use the page namespace.
 */
