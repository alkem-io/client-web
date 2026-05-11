/**
 * Contract: holder-agnostic templates-management view + template card.
 *
 * CRD component: `src/crd/components/templates/TemplatesManagerView.tsx`
 * Consumed by:
 *  - `src/main/crdPages/topLevelPages/spaceSettings/templates/*` (Space Settings → Templates tab, holderKind='space')
 *  - `src/main/crdPages/innovationPack/CrdInnovationPackAdminPage.tsx` (holderKind='innovationPack', canImport(*) === false)
 *  - `src/crd/components/innovationPack/InnovationPackProfileView.tsx` (read-only: all can*() === false, onTemplateAction restricted to 'preview')
 *
 * Plain TypeScript only — never GraphQL generated types. No MUI. Behaviour via callbacks.
 */

/** String-union template type used everywhere in CRD (NOT the GraphQL `TemplateType` enum). */
export type TemplateType = 'space' | 'callout' | 'whiteboard' | 'post' | 'communityGuidelines';

/** Order in which sections render in the manager view (fixed). */
export const TEMPLATE_TYPE_ORDER: readonly TemplateType[] = [
  'space',
  'callout',
  'whiteboard',
  'post',
  'communityGuidelines',
] as const;

/** Minimal shape every template card needs (manager list, picker, library gallery, preview header). */
export type TemplateCardData = {
  id: string;
  type: TemplateType;
  /** profile.displayName — required, non-empty. */
  name: string;
  /** profile.description ?? '' */
  description: string;
  /** profile.tagset?.tags ?? [] */
  tags: string[];
  /** profile.visual?.uri || undefined — undefined ⇒ component renders the pickColorFromId gradient. */
  bannerUrl?: string;
  /** pickColorFromId(template.id) — banner/avatar deterministic fallback colour. */
  color: string;
  /** profile.url — for "open detail" links (library / pack-profile contexts). */
  url?: string;
  /** Owning pack name etc. — only set in library / account-source contexts. */
  ownerLabel?: string;
};

export type TemplateCategorySection = {
  type: TemplateType;
  templates: TemplateCardData[];
};

export type TemplateAction = 'preview' | 'edit' | 'duplicate' | 'delete';

export type TemplatesManagerViewProps = {
  holderKind: 'space' | 'innovationPack';
  categories: TemplateCategorySection[];
  loading?: boolean;
  /** Id of the template currently mid-duplicate — shows a "Creating…" spinner on that row/section. */
  duplicatingId?: string | null;
  /** Id of the template currently mid-delete — shows a "Deleting…" spinner and hides the row optimistically. */
  deletingId?: string | null;
  // The legacy templates-management surfaces (SpaceAdminTemplatesPage / AdminInnovationPackPage) do NO per-type
  // authorisation — they hard-code "all five types" creatable/editable/deletable; the gate is page access.
  // So in a MANAGEMENT context the consumer wires these as `() => true`; in a READ-ONLY context (pack public
  // profile) as `() => false`. There is NO `isCustom` gate (the legacy `TemplatesAdmin` has none). FR-014.
  canCreate: (type: TemplateType) => boolean;
  canEdit: (type: TemplateType) => boolean;
  canDelete: (type: TemplateType) => boolean;
  /** Consumer wires `() => true` for a Space holder in a management context, `() => false` for an Innovation Pack and for read-only contexts (Import is Space-only). */
  canImport: (type: TemplateType) => boolean;
  onCreate: (type: TemplateType) => void;
  onImport: (type: TemplateType) => void;
  onTemplateAction: (id: string, action: TemplateAction) => void;
  className?: string;
};

/**
 * Section visibility rule (FR-015):
 *   render section S ⟺ categories[S].templates.length > 0 || canCreate(S) || canImport(S)
 * An empty-but-addable section renders an empty state plus the available add affordance(s).
 */
