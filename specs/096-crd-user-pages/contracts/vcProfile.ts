/**
 * CRD Virtual Contributor profile view contracts.
 *
 * File location at implementation time:
 *   src/crd/components/virtualContributor/VCPageHero.tsx
 *   src/crd/components/virtualContributor/VCProfileSidebar.tsx
 *   src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx
 *   src/crd/components/virtualContributor/VCContentView.tsx
 *   src/crd/components/virtualContributor/VCPublicProfileView.tsx
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 *
 * The shared `CompactContributorCard` contract lives in `compactContributor.ts`
 * (used by the Host section here AND by the User profile's Organizations
 * sidebar — NOT by the Organization profile's Associates section).
 */

import type { ReactNode } from 'react';
import type { CompactContributorCardItem } from './compactContributor';
import type { ReferenceLink } from './organizationProfile';

/* ----------------------------- VCPageHero -------------------------------- */

export type VCPageHeroProps = {
  avatarImageUrl: string | null;
  displayName: string;
  /**
   * When `null` the Settings (gear) icon is hidden. When set, the icon links
   * to this URL (which is the existing MUI admin URL via
   * `buildSettingsUrl(vc.profile.url)` per FR-031).
   */
  settingsUrl: string | null;
  /**
   * NOTE: VCs do NOT have a Message button (FR-030). This contract intentionally
   * omits `onSendMessage`.
   */
};

/* --------------------------- VCProfileSidebar ---------------------------- */

export type VCProfileSidebarProps = {
  /** Markdown rendering of `vc.profile.description`. */
  description: string | null;
  /**
   * Compact card showing the VC's provider (`vc.provider.profile`). `null` when
   * the VC has no provider (rare).
   */
  host: CompactContributorCardItem | null;
  /**
   * Non-social references only — filtered via `isSocialNetworkSupported`. Social
   * references are surfaced in the right-column content view, not here (FR-032).
   */
  references: ReferenceLink[];
  /**
   * Body of Knowledge section data. `null` only for VCs with no BoK at all
   * (rare but possible — render nothing for the BoK section in that case).
   */
  bodyOfKnowledge: BodyOfKnowledge | null;
  /**
   * i18n-resolved labels. Several are PARITY REUSES of existing
   * `translation`-namespace keys (FR-102) — the mapper resolves them via
   * `t(...)` from the global namespace rather than introducing duplicates
   * under `crd-profilePages`.
   */
  labels: {
    descriptionTitle: string;
    hostTitle: string;
    /** Parity reuse — `components.profile.fields.references.title`. */
    referencesTitle: string;
    /** Parity reuse — `common.no-references`. */
    referencesEmpty: string;
    /** Parity reuse — `components.profile.fields.bodyOfKnowledge.title`. */
    bodyOfKnowledgeTitle: string;
    /** Parity reuse — `components.profile.fields.bodyOfKnowledge.privateBokTooltip`. */
    bodyOfKnowledgePrivateTooltip: string;
    /** Parity reuse — `buttons.visit`. */
    bodyOfKnowledgeVisitButton: string;
    /** Parity reuse — `components.profile.fields.bodyOfKnowledge.spaceBokDescription` (interpolates `{vcName}`). */
    bodyOfKnowledgeSpaceContextDescription: string;
    /**
     * Parity reuse — `components.profile.fields.engines.externalVCDescription`,
     * with `{engineName}` interpolated from `components.profile.fields.engines.externalAssistant`
     * (variant=assistant) or `components.profile.fields.engines.external` (other).
     */
    bodyOfKnowledgeExternalAssistantDescription: string;
    bodyOfKnowledgeExternalOtherDescription: string;
    /** Parity reuse — `components.card.privacy.private` with `entity: 'space'`. */
    privateSpaceLabel: string;
  };
};

/* --------------------- VCBodyOfKnowledgeSection -------------------------- */

/**
 * Discriminated-union BoK contract — the mapper produces one of three shapes
 * (research §4):
 *
 *  - `space` — VC backed by an Alkemio Space. Renders a SpaceCardHorizontal-
 *    equivalent CRD card linking to the space; falls back to "Private space"
 *    placeholder when `hasReadAccess === false`.
 *  - `knowledgeBase` — VC backed by an Alkemio Knowledge Base. Renders the
 *    description plus a Visit button, disabled when `hasReadAccess === false`.
 *  - `external` — VC with no BoK; renders the engine-type description.
 */
export type BodyOfKnowledge =
  | {
      kind: 'space';
      /**
       * Always populated. When `hasReadAccess === false`, the mapper produces
       * a placeholder `SpaceProfileSummary` matching current MUI parity:
       *   - `displayName: t('components.card.privacy.private', { entity: 'space' })`
       *   - `url: ''`, `id: ''`, `avatarImageUrl: null`, `level: 'L0'`
       * The view renders the same `SpaceCardHorizontal`-equivalent for both
       * read-allowed and private cases — no separate "Private space"
       * component (Q7 — match MUI).
       */
      spaceProfile: SpaceProfileSummary;
      hasReadAccess: boolean;
      /** vc.bodyOfKnowledgeDescription — rendered above the card regardless of read access. */
      description: string | null;
      /** vc.profile.displayName — used to interpolate the spaceBokDescription caption. */
      vcDisplayName: string;
      /**
       * i18n-resolved caption rendered above the space-backed card with the VC's
       * displayName interpolated in (e.g., "Spaces hosted by {{vcName}}…"). The
       * mapper calls `t('components.profile.fields.bodyOfKnowledge.spaceBokDescription', { vcName })`.
       * Pass an empty string when the consumer wants to suppress the caption.
       */
      spaceContextDescription: string;
    }
  | {
      kind: 'knowledgeBase';
      /**
       * Resolved by the mapper:
       *   description = useKnowledgeBase().knowledgeBaseDescription
       *               || t('virtualContributorSpaceSettings.placeholder')
       * Exact parity with current MUI `VCProfilePageView`'s
       * `knowledgeBaseDescription || t('virtualContributorSpaceSettings.placeholder')`.
       * The view receives a populated string and never branches on emptiness.
       */
      description: string;
      hasReadAccess: boolean;
      visitUrl: string;                  // ${vc.profile.url}/${KNOWLEDGE_BASE_PATH}
    }
  | {
      kind: 'external';
      /**
       * Fully i18n-resolved engine-type description. The mapper derives this
       * from `vc.aiPersona.engine` — when the engine is `OpenaiAssistant` it
       * resolves `externalAssistantDescription`; otherwise `externalGenericDescription`.
       * Both come from `components.profile.fields.engines.externalVCDescription`
       * with the engine name interpolated in. The view renders the string
       * through `MarkdownContent` (the description may contain a link).
       *
       * NOTE: an earlier draft of this contract declared `engineLabel: 'assistant' | 'other'`
       * and let the view resolve the copy. That was inverted in the implementation —
       * the integration layer owns translation resolution (FR-005), so the
       * resolved string crosses the boundary, not the discriminator.
       */
      description: string;
    };

export type SpaceProfileSummary = {
  id: string;
  url: string;
  displayName: string;
  level: 'L0' | 'L1' | 'L2';
  avatarImageUrl: string | null;
};

export type VCBodyOfKnowledgeSectionProps = {
  bodyOfKnowledge: BodyOfKnowledge;
  labels: VCProfileSidebarProps['labels'];
};

/* ----------------------------- VCContentView ----------------------------- */

/**
 * F3 correction (vs. earlier draft):
 *
 * The earlier draft listed `prompts.persona`, `prompts.constraints`, and
 * `dataPrivacy.summary` — none of those fields exist on the GraphQL
 * `VirtualContributorModelCard` type. The MUI `VCProfileContentView` works
 * around this by rendering hard-coded placeholder data via
 * `useTemporaryHardCodedVCProfilePageData(modelCard)` (with a TODO comment in
 * the MUI source: `// REMOVE when data is fetched from server`).
 *
 * The CRD content view modernizes rather than parity-restyles: it renders the
 * **real** `aiEngine.*` fields that DO exist on the GraphQL model card. The
 * MUI's hard-coded `functionality` and `monitoring` blocks are out of scope
 * (re-rendering placeholder data in CRD would entrench tech debt).
 */
export type ModelCardSummary = {
  aiEngine: {
    name: string;                        // engine identifier (e.g., 'openai-assistant', 'external')
    isExternal: boolean;
    hostingLocation: string;             // free-form provenance string
    isUsingOpenWeightsModel: boolean;
    canAccessWebWhenAnswering: boolean;
    additionalTechnicalDetails: string | null;
  };
  monitoring: {
    isUsageMonitoredByAlkemio: boolean;
  };
};

// SocialReferenceItem has been removed — social-link rendering and the
// social/non-social split now live entirely inside the shared CRD `SocialLinks`
// primitive at `src/crd/components/common/SocialLinks.tsx`. See the matching
// note in `organizationProfile.ts`.

export type VCContentViewProps = {
  modelCard: ModelCardSummary;
  /**
   * ALL references — passed straight to `<SocialLinks references={refs} />`,
   * which filters internally to the social subset and brand-resolves the icon.
   * Same one-source-of-truth contract used on the Organization sidebar.
   */
  references: ReferenceLink[];
  /**
   * F3 correction: prompts/dataPrivacy labels removed (the corresponding
   * `ModelCardSummary` fields no longer exist — see the F3 note above the
   * `ModelCardSummary` type).
   */
  labels: {
    modelCardTitle: string;
    aiEngineLabel: string;
    /** Suffix shown after the engine name when `isExternal === true` (e.g., "External"). */
    aiEngineExternal: string;
    socialLinksTitle: string;
    socialLinksEmpty: string;
  };
};

/* ----------------------- VCPublicProfileView ----------------------------- */

export type VCPublicProfileViewProps = {
  vc: {
    id: string;
    slug: string;
    isOwn: boolean;
    hasUpdatePrivilege: boolean;
    hero: VCPageHeroProps;
    sidebar: VCProfileSidebarProps;
    contentView: VCContentViewProps;
  };

  /**
   * Per-region loading flags (FR-009). Mapping (data-model.md "Query → region"):
   *   - `hero` / `sidebar` (excl. BoK) / `contentView`  ← useVirtualContributorProfileWithModelCardQuery
   *   - `bodyOfKnowledge`                                ← BoK auxiliary queries
   *     (useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery + useSpaceBodyOfKnowledgeAboutQuery
   *      for space-backed; useKnowledgeBase for knowledge-base-backed; n/a for external)
   *
   * The BoK section unblocks independently — the rest of the page can paint
   * before the auxiliary BoK queries resolve.
   */
  loading: {
    hero: boolean;
    sidebar: boolean;
    bodyOfKnowledge: boolean;
    contentView: boolean;
  };

  /**
   * i18n-resolved aria-labels for the per-region skeleton `<output>` containers
   * (WCAG 2.1 AA). Three entries — `bodyOfKnowledge` is rendered inside the
   * sidebar so it shares the sidebar label rather than getting its own. Resolved
   * from the `crd-profilePages` `common.loading.*` namespace.
   */
  loadingLabels: {
    hero: string;
    sidebar: string;
    contentView: string;
  };

  /** Optional slot for portals. */
  children?: ReactNode;
};
