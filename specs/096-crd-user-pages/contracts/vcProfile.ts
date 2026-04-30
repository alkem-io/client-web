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
 * (used by the Host section here AND by the Organization profile's Associates section).
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
  /** i18n-resolved labels. */
  labels: {
    descriptionTitle: string;
    hostTitle: string;
    referencesTitle: string;
    referencesEmpty: string;
    bodyOfKnowledgeTitle: string;
    bodyOfKnowledgePrivateTooltip: string;
    bodyOfKnowledgeVisitButton: string;
    bodyOfKnowledgeSpaceContextDescription: string;
    bodyOfKnowledgeExternalAssistantDescription: string;
    bodyOfKnowledgeExternalOtherDescription: string;
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
      spaceId: string | null;            // null when not visible to the viewer
      spaceProfile: SpaceProfileSummary | null;  // null when hasReadAccess is false
      hasReadAccess: boolean;
      description: string | null;        // vc.bodyOfKnowledgeDescription
    }
  | {
      kind: 'knowledgeBase';
      description: string;               // useKnowledgeBase().knowledgeBaseDescription (or placeholder)
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

  /** Optional slot for portals. */
  children?: ReactNode;
};
