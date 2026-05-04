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
  /**
   * Banner image. When `null` the component renders a deterministic gradient
   * computed via `pickColorFromId(vcId)` (FR-030).
   */
  bannerImageUrl: string | null;
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
      engineLabel: 'assistant' | 'other'; // derived from vc.aiPersona.engine === OpenaiAssistant
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

export type ModelCardSummary = {
  aiEngine: {
    name: string;                        // e.g., "OpenAI Assistant", "External"
    isExternal: boolean;
  };
  prompts: {
    persona: string | null;
    constraints: string | null;
  };
  dataPrivacy: {
    summary: string | null;
  };
};

export type SocialReferenceItem = {
  id: string;
  name: string;                          // 'LinkedIn' | 'Bluesky' | 'GitHub' | 'X' | …
  uri: string;
  brand: 'linkedin' | 'bluesky' | 'github' | 'x' | 'generic';
};

export type VCContentViewProps = {
  modelCard: ModelCardSummary;
  /** Filtered to the "social" group of references via `isSocialNetworkSupported`. */
  socialReferences: SocialReferenceItem[];
  /** i18n-resolved labels. */
  labels: {
    modelCardTitle: string;
    aiEngineLabel: string;
    promptsLabel: string;
    promptsPersonaLabel: string;
    promptsConstraintsLabel: string;
    dataPrivacyLabel: string;
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

  /** Optional slot for portals. */
  children?: ReactNode;
};
