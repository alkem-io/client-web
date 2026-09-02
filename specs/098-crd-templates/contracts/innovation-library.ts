/**
 * Contract: the Innovation Library page (`/innovation-library`) — CRD.
 *
 * CRD components:
 *  - `src/crd/components/innovationLibrary/InnovationLibraryView.tsx` — page body (packs section + template gallery + type filter)
 *  - `src/crd/components/innovationLibrary/TemplateGallery.tsx`        — filterable grid of all platform templates
 *  - `src/crd/components/innovationLibrary/TemplateTypeFilter.tsx`     — type filter (desktop + mobile variants)
 *
 * Integration: `src/main/crdPages/innovationLibrary/CrdInnovationLibraryPage.tsx` (uses `useInnovationLibraryQuery`)
 * Routing: `/innovation-library` in `TopLevelRoutes.tsx`, toggle-gated (CRD vs. legacy `InnovationLibraryPage`).
 * Viewable by anyone, including signed-out visitors (FR-050).
 */

import type { InnovationPackCardData } from './innovation-pack';
import type { TemplateCardData, TemplateType } from './templates-manager';
import type { TemplateContent } from './template-preview';

export type TemplateTypeFilterValue = TemplateType[] | 'all';

export type TemplateTypeFilterProps = {
  value: TemplateTypeFilterValue;
  onChange: (next: TemplateTypeFilterValue) => void;
  /** Optional per-type counts to render alongside the filter chips. */
  counts?: Partial<Record<TemplateType, number>>;
};

export type TemplateGalleryProps = {
  /** Already filtered by the active type filter (the consumer applies it — legacy filters client-side over one fetch). */
  templates: TemplateCardData[];
  loading?: boolean;
  onPreview: (templateId: string) => void;
  /** Empty state when no templates match (FR-053). */
  emptyLabel: string;
};

export type InnovationLibraryViewProps = {
  /** Store-listed Innovation Packs — cards link to each pack's public profile via `url`. */
  packs: InnovationPackCardData[];
  packsLoading?: boolean;
  /** All platform templates (union across listed packs) — the gallery applies `activeTypeFilter`. */
  templates: TemplateCardData[];
  templatesLoading?: boolean;
  activeTypeFilter: TemplateTypeFilterValue;
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void;
  onTemplatePreview: (templateId: string) => void;
  /** Lazily-loaded preview content for the open template (undefined while loading). */
  previewContent?: TemplateContent;
  previewLoading: boolean;
};
